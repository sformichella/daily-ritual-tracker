export type Middleware<In, Out, NextIn> = <NextOut>(next: (value: NextIn) => NextOut) => (value: In) => Out | NextOut

export type In<M extends Middleware<any, any, any>> = M extends Middleware<infer In, any, any> ? In : never
export type Out<M extends Middleware<any, any, any>> = M extends Middleware<any, infer Out, any> ? Out : never
export type NextIn<M extends Middleware<any, any, any>> = M extends Middleware<any, any, infer NextIn> ? NextIn : never

export class Stack<StackIn, StackOut, StackNextIn> {
  private middleware: Middleware<StackIn, StackOut, StackNextIn>

  constructor(middleware: Middleware<StackIn, StackOut, StackNextIn>) {
    this.middleware = middleware
  }

  push <NextOut, NextNextIn>(middleware: Middleware<StackNextIn, NextOut, NextNextIn>) {
    const composed: Middleware<StackIn, NextOut | StackOut, NextNextIn> = (next) => {
      return this.middleware(middleware(next))
    }

    return new Stack(composed)
  }

  unshift <FirstIn, FirstOut>(middleware: Middleware<FirstIn, FirstOut, StackIn>) {
    const composed: Middleware<FirstIn, FirstOut | StackOut, StackNextIn> = (next) => {
      return middleware(this.middleware(next))
    }

    return new Stack(composed)
  }

  get() {
    return this.middleware(x => x)
  }
}