import {
    Observable, ObservableInput, ObservedValueOf, OperatorFunction, Subscriber,Subscription, Operator
  } from 'rxjs'
  
  import { InnerSubscriber } from 'rxjs/InnerSubscriber';
  import { OuterSubscriber } from 'rxjs/OuterSubscriber';
  import { subscribeToResult } from 'rxjs/util/subscribeToResult';
  
  /* tslint:disable:max-line-length */
  export function switchMapBy<T, O extends ObservableInput<any>>(property: string, project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>> {
    return (source: Observable<T>) => source.lift(new SwitchMapByOperator(property, project));
  }
  /* tslint:enable:max-line-length */
  
  class SwitchMapByOperator<T, R> implements Operator<T, R> {
    constructor(private property: string, private project: (value: T, index: number) => ObservableInput<R>) {
    }
  
    call(subscriber: Subscriber<R>, source: any): any {
  
      return source.subscribe(new SwitchMapBySubscriber(subscriber,this.property, this.project));
    }
  }
  
  /**
   * We need this JSDoc comment for affecting ESDoc.
   * @ignore
   * @extends {Ignored}
   */
  class SwitchMapBySubscriber<T, R> extends OuterSubscriber<T, R> {
    private index: number = 0;
    private subscriptionMap: Map<string,Subscription> = new Map<string,Subscription>();
    private innerCompleted = false;
  
    constructor(destination: Subscriber<R>,
                private property: string,
                private project: (value: T, index: number) => ObservableInput<R>) {
      super(destination);
    }
  
    private unsubscribeInner(value: string | Subscription) {
      const id: string = value instanceof Subscription ? this.getTag(value) : value;
      if (this.subscriptionMap.has(id)) {
          this.subscriptionMap.get(id).unsubscribe();
          this.subscriptionMap.delete(id);
      }
    }
  
    private unsubscribeAll() {
      this.subscriptionMap.forEach((value: Subscription, key: string) => this.unsubscribeInner(key));
    }
  
    private saveInnerSubscription(
      id: string,
      subscription: Subscription
    ) {
      this.subscriptionMap.set(id, 
        this.setTag(id, subscription)
      );
    }
  
    private setTag(
      id: string,
      subscription: Subscription
    ): Subscription {
      (subscription as any).tagID = id;
      return subscription;
    }
  
    private getTag(subscription: Subscription): string {
      return (subscription as any).tagID;
    }
  
    protected _next(value: T) {
      
      let result: ObservableInput<R>;
      const index = this.index++;
      
      try {
        result = this.project(value, index);
      } catch (error) {
        this.destination.error(error);
        return;
      }
      console.log('switchMapBy :: serving :: ', value);
      this._innerSub(result, value, index);
    }
  
    private _innerSub(result: ObservableInput<R>, value: T, index: number) {
      const id = value[this.property];
      this.unsubscribeInner(id);
  
      const innerSubscriber = new InnerSubscriber(this, undefined, undefined);
      const destination = this.destination as Subscription;
      destination.add(innerSubscriber);
  
      const innerSubscription = 
        subscribeToResult(this, result, value, index,innerSubscriber);
      
      this.saveInnerSubscription(id, innerSubscription);
    }
  
    protected _complete(): void {
      if(!this.subscriptionMap.size){
        console.log('switchMapBy :: complete');
        super._complete();
      }
    }
  
    protected _unsubscribe() {
      console.log('switchMapBy :: unsubscribe');
      this.unsubscribeAll();
      this.unsubscribe();
    }
  
    notifyComplete(innerSub: Subscription): void {
      console.log('switchMapBy :: inner-subscription :: completed');
      const destination = this.destination as Subscription;
      this.unsubscribeInner(innerSub);
      destination.remove(innerSub);
      if (this.isStopped) {
        this._complete();
      }
    }
  
    notifyNext(
      outerValue: T,
      innerValue: R,
      outerIndex: number,
      innerIndex: number,
      innerSub: InnerSubscriber<T, R>
    ): void {
        this.destination.next(innerValue);
    }
  
  }