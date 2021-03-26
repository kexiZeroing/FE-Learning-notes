## Angular Unit Test
### Jasmine and Karma
When creating Angular projects using the Angular CLI it defaults to create and run unit tests using Jasmine and Karma.  
- **Jasmine** is a JavaScript testing framework that supports a software development practice called Behavior-Driven Development. It attempts to describe tests in a human readable format. 
- **Karma** is a test runner which lets us spawn browsers and run Jasmine tests inside of them all from the command line. The results of the tests are also displayed on the command line. Karma can also watch your development files for changes and re-run the tests automatically. 

### Basic elements
The `describe` function defines what we call a Test Suite, a collection of individual Test Specs. The `it` function defines an individual Test Spec, this contains one or more Test Expectations. You can pre-pending `x`(disable) or `f`(focus) to the `describe` or `it`.

`beforeAll` is called once, before all the specs in a test suite (describe function) are run.  
`afterAll` is called once after all the specs in a test suite are finished.   
`beforeEach` is called before each test spec (it function) is run.  
`afterEach` is called after each test spec is run.

Create an expectation for a spec:
```js
expect(thing).toBe(realThing);
expect(something).not.toBe(true);
expect(result).toBeDefined();
expect(result).toBeUndefined();
expect(result).toBeNull();

expect(result).toBeFalse();
expect(result).toBeFalsy();
expect(result).toBeTrue();
expect(result).toBeTruthy();

expect(result).toBeGreaterThan(3);
expect(result).toBeLessThan(0);
expect(array).toContain(anElement);
expect(bigObject).toEqual({"foo": ['bar', 'baz']});

expect(mySpy).toHaveBeenCalled();
expect(mySpy).not.toHaveBeenCalled();
expect(mySpy).toHaveBeenCalledTimes(3);
expect(mySpy).toHaveBeenCalledWith('foo', 'bar', 2);
```

### Mock and Spy
We want to test pieces of code in isolation without needing to know about the inner workings of their dependencies. We create mocks using fake classes and taking control of them with Spies.

`spyOn` installs a spy onto an existing object. (can only be used when the method already exists in the object)
- By chaining the spy with `and.callThrough`, the spy will track all calls to it but delegate to the actual implementation. 
- By chaining the spy with `and.callFake`, all calls to the spy will delegate to the supplied function (with parameters). This allows you to fake the method call and return a value of your desire. 
- By chaining the spy with `and.returnValue`, all calls to the function will return a specific value. 
- When a calling strategy is used for a spy (e.g., use `callThrough` in a beforeEach), the original stubbing behavior can be returned at any time with `and.stub`.

`jasmine.createSpy` creates a bare Spy object. This won't be installed anywhere and will not have any implementation behind it. It will track calls and arguments like a spyOn.
```js
  it('jasmine.createSpy', function() {
    const spy = jasmine.createSpy('spy');
    const baz = {
      fn: spy
    };

    spy.and.callFake((val) => val);
    let res = baz.fn(123);
    
    expect(spy).toHaveBeenCalled();
    expect(res).toBe(123);
  });
```

`jasmine.createSpyObj` returns the object that was created, which just happens to have each of its properties be a Spy.
```js
  it('asmine.createSpyObj', function() {
    let spy = jasmine.createSpyObj('tapeName', ['foo', 'bar']);
    spy.bar.and.returnValue(123);
    spy.foo();
    let res = spy.bar();

    expect(spy.foo).toHaveBeenCalled();
    expect(res).toBe(123);
  });

  // another signature: jasmine.createSpyObj(methodNames)
  // Array of method names to create spies for, or Object whose keys will be method names and values the returnValue.
  mockService = jasmine.createSpyObj<AService>({
    foo: () => Promise.resolve(),
    bar: () => {}
  });
```

### Access private member 
> Only unit test the public API and do not write tests for private methods. The point of "don't test private methods" is to test the class like someone who uses it. There are times when it doesn't seem that simple and you feel you are choosing between compromising either the API or the unit-tests.

Even though TS restricts access to class members using private, protected, public, the compiled JS has no private members, since this isn't a thing in JS. It's purely used for the TS compiler.

1. Assert type to `any`: `(component as any)._id = 1`.
2. Use `// @ts-ignore` comment before the statement.

### Test async operations
#### setTimeout and done
Our test specs can take a parameter, and Jasmine lets us create asynchronous tests by giving us an explict `done` function which we call when the test is complete.

```js
  it('setTimeout and done', (done) => {
    const spy = spyOn(component, 'foo').and.returnValue(of(1));
    component.bar();
    setTimeout(() => {
      expect(spy).toHaveBeenCalled();
      done();
    }, 100);
  });
```

#### fakeAsync and tick
`fakeAsync` function executes the code inside its body in a special fake async test zone. The `tick()` function blocks execution and simulates the passage of time until all pending asynchronous activities complete.

```js
  it('should remove the overlay of loading screen', fakeAsync(() => {
    component.foo = true;
    component.hideFoo();
    tick(1000);
    expect(component.foo).toBe(false);
  }));
```

#### flushMicrotasks
Flush any pending microtasks (process.nextTick, Promise...).

Using together `fakeAsync` and `tick` / `flushMicrotasks` allows you to simulate asynchronous processing but in a synchronous way. So it's guaranteed that the callback is executed before executed your expectations (make sure no async work remains unfinished after the test is complete).

- Microtasks are manually executed by calling `flushMicrotasks()`.
- Timers are synchronous, `tick()` simulates the asynchronous passage of time.

```js
it('flushMicrotasks', fakeAsync(() => {
  spyOn(service, 'foo').and.returnValue(Promise.reject('error'));
  component.bar();
  flushMicrotasks();

  expect(component.error).toBe(true);
}));
```

### Test a component
#### TestBed
In the `beforeEach` function for our test suite we configure a testing module using the TestBed. Just like configuring an regular `@NgModule`, this creates a test Angular Module where we add any components, modules and services we need (and perform dependency injection).

```js
beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    declarations: [FooComponent],
    providers: [
      SpyHelper.provideMockService(FooService),
      { provide: BarService, useClass: MockBarService },
      { provide: BazService, useValue: mockBazService },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  });
});

beforeEach(() => {
  fixture = TestBed.createComponent(Component);
  component = fixture.componentInstance;
  mockBarService = TestBed.inject(BarService);
  fixture.detectChanges();
});
```

- A **fixture** is a wrapper for our component’s environment. We can find the actual component from `fixture.componentInstance`. `fixture.debugElement` is a class that contains all kinds of references and methods relevant to investigate an element in the component.
- You must tell the TestBed to perform data binding by calling **`fixture.detectChanges()`**. Trigger change detection so a component’s view updates based on state changes in our application.
- Call **`compileComponents()`** to compile components with a templateUrl for the test's NgModule. But if you're using webpack, the build will compile the templateUrls into inline templates and styleUrls to styles precedes running the test, so there is no need to compileComponents.
- Including **`CUSTOM_ELEMENTS_SCHEMA`** in the module allows the use of the components in the template without the compiler producing errors. It allows non-Angular elements named with dash-case and element properties named with dash-case. The **`NO_ERRORS_SCHEMA`** tells the compiler to ignore unrecognized elements and attributes. It Defines a schema that allows any property on any element.
- `fixture.detectChanges()` will trigger `ngOnInit()` and we have `fixture.detectChanges()` in every `beforeEach`, so we need to make sure we validate all the logic in `ngOnInit` function before running any test.
- If your component uses the dependent services that have `{providedIn: 'root'}` and when you make a test for the component, the **service implicitly provided**. The services registered with `providedIn` aren’t loaded in the test, they are instantiated lazily, only when they are needed. (We used to register the service in the providers of the testing module to be able to test it).
- **Dependency injection** with `useClass`, `useValue` and `useFactory`. [SpyHelper](https://gist.github.com/lydemann/f94c36147fc232851824e6421ce0a98f) helps mock and spy all the functions in a service.

```js
// useClass
class MockBarService {
  deleteItem$ = new Subject();
  isShapeData = () => {};
}

// useValue
mockBazService: jasmine.SpyObj<mockBazService> = jasmine.createSpyObj('BazService', ['fun1', 'fun2']);

// useFactory
useFactory: () => {
  return isProd ? new AService() : new BService();
}
```

#### Be careful about the mock service type and spyHelper
1. `and` method and `toHaveBeenCalled()` can be only used on a spy.
2. `spyHelper` only creates the spy for each method in the service, but does not handle the property.

```js
let mockFooService: FooService;
let mockBarService: jasmine.SpyObj<BarService>;
let mockBazService: any;

mockFooService = TestBed.inject(FooService);
mockBarService = TestBed.inject(BarService) as jasmine.SpyObj<BarService>;
mockBazService = TestBed.inject(BazService);

expect(mockFooService.func).toHaveBeenCalled();  // Wrong! Expected a spy, but got Function
mockFooService.func.and.returnValue(1);  // Wrong! `and` does not exist on type () => {}
mockBarService.func.and.returnValue(1);  // Correct
// have `public func = jasmine.createSpy()` declared in the MockFooService class
mockFooService.func.and.returnValue(1);  // Correct

// SpyHelper.provideMockService(FooService) in providers
mockFooService.abc$.next(1);  // Wrong! Cannot read property 'next' of undefined

// abc$ = new BehaviorSubject(1) in mock class
mockFooService.abc$.next(1);  // Correct
```

#### The practice that we can have a try
The premice is that we don't care about details in the dependent service and don't want the logic in other places affects the current component.

- If a service only has methods, we use `SpyHelper` which returns an object with all the function attributes spied. So in the spec, we can either give it a return value or just check if it gets called. Note that when you call `TestBed.inject` to get that service, you need to cast its type to `SpyObj<FooService>`. (Another way to do this is using provider `useValue` and `jasmine.createSpyObj()` which has return value for each method. We don't choose it since we already import the `SpyHelper`.)

- If a service has many properties(observable) used in `ngOnInit`, we would better to have a mock class with provider `useClass` which creates all properties needed in the component creation, otherwise we need to add them in each test. In this way, we actually overwrite this service class, so if you also want to mock the function in it, you should use `func = jasmine.createSpy()` to spy a function in this mock service class.

- If we only need some tokens or functions that we don't want to spy (the function will never appear in our test spec), we use provider `useValue` and give it a value directly.

#### import and mock an external function
We need to set `"module": "commonjs"` in `tsconfig.spec.json`.

> This is going to largely come down to what code is being generated by your bundler as to whether this is mockable. If `import { sayHello } from './utils'` becomes `const sayHello = require('./utils').sayHello` then the original function will already be saved off into a local variable and there isn't anything Jasmine can do to replace a local variable. However, if it becomes `const utils = require('./utils')` and usages are `utils.sayHello()`, then mocking `sayHello` function on the object returned by require should work fine.

```js
// `helper` is an external utility function
import * as helperUtil from './helper';

spyOn(helperUtil, 'helper').and.returnValue({});
```

### Test service and effect
The basic testing idea and methods are the same, but there are no component lifecycle hooks, so we don't need any preparation work to do like providing observables in `ngOnInit`. We only mock what we want in the specific test we are working on. Basically we can always use `SpyHelper` to mock all the functions and cast the mock service's type as `SpyObj<XXXService>`. Note that we don't handle properties in the `SpyHelper`, so we can directly add a property to the mock object if needed in the spec, e.g., `fooService.bar$ = new BehaviorSubject(1)`, and use `(fooService as any).bar$` if the property is private.

#### Writing marble tests
