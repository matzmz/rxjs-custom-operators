# RxJS custom operators
## switchMapBy
```typescript
function switchMapBy<T, O extends ObservableInput<any>>(property: string, project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>
```

![alt text](https://github.com/matzmz/rxjs-custom-operators/blob/master/doc/switchmapby_marble.svg "switchMapBt marble diagram")

## exhaustMapBy
```typescript
function exhaustMapBy<T, O extends ObservableInput<any>>(property: string, project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>
```

![alt text](https://github.com/matzmz/rxjs-custom-operators/blob/master/doc/exhaustmapby_marble.svg "switchMapBt marble diagram")

