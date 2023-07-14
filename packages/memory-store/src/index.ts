import {
  ICategory,
  StreamToken,
  SyncResult,
  ITimelineEvent,
  TokenAndState,
  IReloadableCategory,
  ICodec,
} from "@equinox-js/core"
import * as Equinox from "@equinox-js/core"
import { randomUUID } from "crypto"
import { Subject } from "rxjs"

export class VolatileStore<Format> {
  private readonly streams: Map<string, ITimelineEvent<Format>[]> = new Map()
  private readonly $all = new Subject<{
    category: string
    streamId: string
    events: ITimelineEvent<Format>[]
  }>()

  load(streamName: string) {
    return this.streams.get(streamName) ?? []
  }

  trySync(
    streamName: string,
    categoryName: string,
    streamId: string,
    expectedCount: number,
    events: ITimelineEvent<Format>[]
  ) {
    const currentValue = this.streams.get(streamName) ?? []
    if (currentValue.length !== expectedCount) return { success: false, events: currentValue }
    const newValue = [...currentValue, ...events]
    this.streams.set(streamName, newValue)
    this.$all.next({ category: categoryName, streamId, events })
    return { success: true, events: events }
  }
}

namespace Token {
  export type Token = number
  export const streamTokenOfEventCount = (count: number): StreamToken => ({
    value: count,
    version: BigInt(count),
    bytes: 0n,
  })

  export const unpack = (token: StreamToken) => token.value as Token
  export const empty = streamTokenOfEventCount(0)
  export const ofValue = (events: unknown[]) => streamTokenOfEventCount(events.length)
  export const supersedes = (current: StreamToken, proposed: StreamToken) =>
    proposed.version > current.version
}

class Category<Event, State, Context, Format>
  implements IReloadableCategory<Event, State, Context>
{
  constructor(
    private readonly store: VolatileStore<Format>,
    private readonly codec: ICodec<Event, Format, Context>,
    private readonly fold: (state: State, events: Event[]) => State,
    private readonly initial: State
  ) {}

  supersedes = Token.supersedes

  async load(
    _categoryName: string,
    _streamId: string,
    streamName: string,
    _allowStale: boolean,
    _requireLeader: boolean
  ): Promise<TokenAndState<State>> {
    const result = this.store.load(streamName)
    const token = Token.ofValue(result)
    const events = this.decodeEvents(result)

    return { token, state: this.fold(this.initial, events) }
  }

  private decodeEvents(encoded: ITimelineEvent<Format>[]) {
    const events: Event[] = []
    for (const ev of encoded) {
      const decoded = this.codec.tryDecode(ev)
      if (decoded != null) events.push(decoded)
    }
    return events
  }
  private async encodeEvents(eventCount: number, ctx: Context, events: Event[]) {
    const encoded: ITimelineEvent<Format>[] = []
    for (let i = 0; i < events.length; ++i) {
      const streamEvent = this.codec.encode(events[i], ctx)
      encoded.push({
        ...streamEvent,
        id: streamEvent.id ?? randomUUID(),
        isUnfold: false,
        size: 0,
        time: new Date(),
        index: BigInt(eventCount + i),
      })
    }
    return encoded
  }

  async trySync(
    categoryName: string,
    streamId: string,
    streamName: string,
    context: Context,
    originToken: StreamToken,
    originState: State,
    events: Event[]
  ): Promise<SyncResult<State>> {
    const eventCount = Token.unpack(originToken)
    const encoded = await this.encodeEvents(eventCount, context, events)
    const res = this.store.trySync(streamName, categoryName, streamId, eventCount, encoded)
    if (res.success) {
      return {
        type: "Written",
        data: { token: Token.ofValue(events), state: this.fold(originState, events) },
      }
    }
    const conflictingEvents = res.events
    const resync = async (): Promise<TokenAndState<State>> => {
      const token = Token.ofValue(conflictingEvents)
      const events = this.decodeEvents(conflictingEvents)
      return { token, state: this.fold(originState, events.slice(eventCount)) }
    }
    return { type: "Conflict", resync }
  }

  async reload(
    streamName: string,
    _requireLeader: boolean,
    _t: TokenAndState<State>
  ): Promise<TokenAndState<State>> {
    const result = this.store.load(streamName)
    const token = Token.ofValue(result)
    const events = this.decodeEvents(result)

    return { token, state: this.fold(this.initial, events) }
  }
}

export class MemoryStoreCategory<Event, State, Context> extends Equinox.Category<
  Event,
  State,
  Context
> {
  constructor(
    resolveInner: (
      categoryName: string,
      streamId: string
    ) => readonly [ICategory<Event, State, Context>, string],
    empty: TokenAndState<State>
  ) {
    super(resolveInner, empty)
  }

  static create<Event, State, Format, Context = null>(
    store: VolatileStore<Format>,
    codec: ICodec<Event, Format, Context>,
    fold: (state: State, events: Event[]) => State,
    initial: State
  ) {
    const category = new Category(store, codec, fold, initial)
    const resolveInner = (categoryName: string, streamId: string) =>
      [category, `${categoryName}-${streamId}`] as const
    const empty: TokenAndState<State> = { token: Token.empty, state: initial }
    return new MemoryStoreCategory(resolveInner, empty)
  }
}
