import  { of, Observable, timer } from "rxjs";
import {
  map,
  take,
  concatMap
}  from "rxjs/operators";
import { switchMapBy } from "./operators/switch-map-by";
import { exhaustMapBy } from "./operators/exhaust-map-by";

function dummyRequest(id: string, ms: number = 1000) {
    return Observable.create((observer) => {
      console.log('dummyRequest :: started :: ', id);
      let emitted = false;
      const timeout = setTimeout(() => {
          emitted = true;
          observer.next(id);
          observer.complete();
          console.log('dummyRequest :: completed :: ', id);
        }, ms);
  
      return () => {
        clearTimeout(timeout);
        if(!emitted) {
          console.warn('dummyRequest :: cancelled :: ', id);
        }
      }
    });
}

const actions$ = timer(1000,250).pipe(
  map(value => (value % 2)+1),
  map(id => { return {id}; }),
  take(10)
);

const innerObservableFn = i =>
  of(i).pipe(
    concatMap(({id}) => dummyRequest(id)),
    map(() => i.id)
  );

const subSwitchMapBy = actions$.pipe(switchMapBy('id',innerObservableFn))
    .subscribe(v => console.log(`SWITCHMAPBY :: RESULT :: ${v} :: ${new Date()}`));

const subExhaustMapBy = actions$.pipe(exhaustMapBy('id',innerObservableFn))
    .subscribe(v => console.log(`EXHAUSTMAPBY :: RESULT :: ${v} :: ${new Date()}`));
