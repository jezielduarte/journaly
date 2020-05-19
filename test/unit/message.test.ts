import { Journaly } from '../../source/index';
const timeout = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
let stringArray;
let objectArray;
const function1 = async (object): Promise<string> => {
  await timeout(1000);
  stringArray.push('test 1 asd');
  objectArray.push(object);
  return new Promise((resolve) => resolve('1asd'));
};

const function2 = async (object): Promise<string> => {
  stringArray.push('test 1 qwe');
  objectArray.push(object);
  return new Promise((resolve) => resolve('1qwe'));
};

const function3 = async (object, object2): Promise<string> => {
  stringArray.push('test 2 asd');
  objectArray.push([object, object2]);
  await timeout(500);
  return new Promise((resolve) => resolve('2asd'));
};

const function4 = async (object, object2): Promise<string> => {
  stringArray.push('test 2 qwe');
  objectArray.push([object, object2]);
  await timeout(500);
  return new Promise((resolve) => resolve('2qwe'));
};

class Class0 {
  private simpleString = 'asd';
  constructor(simpleString?: string) {
    if (simpleString) this.simpleString = simpleString;
  }
  public async function1(object): Promise<string> {
    await timeout(1000);
    stringArray.push('test 1 ' + this.simpleString);
    objectArray.push(object);
    return new Promise((resolve) => resolve('1asd'));
  }

  public async function2(object): Promise<string> {
    stringArray.push('test 1 qwe');
    objectArray.push(object);
    return new Promise((resolve) => resolve('1qwe'));
  }

  public async function3(object, object2): Promise<string> {
    stringArray.push('test 2 asd');
    objectArray.push([object, object2]);
    await timeout(500);
    return new Promise((resolve) => resolve('2asd'));
  }

  public async function4(object, object2): Promise<string> {
    stringArray.push('test 2 qwe');
    objectArray.push([object, object2]);
    await timeout(500);
    return new Promise((resolve) => resolve('2qwe'));
  }
}

test(
  'Without Memory: subscribe 2 functions one slow and another fast' +
    ' then subscribe one medium' +
    ' then publish to each then check order',
  async (done) => {
    stringArray = new Array<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectArray = new Array<any>();
    const journaly = new Journaly<string>();
    const subscribe1 = journaly.subscribe('test', function1);
    const subscribe2 = journaly.subscribe('test', function2);
    const subscribe3 = journaly.subscribe('test2', function3);

    const subscribes = await Promise.all([subscribe1, subscribe2, subscribe3]);

    expect(subscribes[0]).toStrictEqual([]);
    expect(subscribes[1]).toStrictEqual([]);
    expect(subscribes[2]).toStrictEqual([]);

    const publish1 = journaly.publish('test', { a: 'a' });
    const publish2 = journaly.publish('test2', { a: 'a' }, { b: 'b' });

    const publishes = await Promise.all([publish1, publish2]);

    expect(publishes[0]).toStrictEqual(['1asd', '1qwe']);
    expect(publishes[1]).toStrictEqual(['2asd']);

    expect(stringArray).toStrictEqual([
      'test 1 qwe',
      'test 2 asd',
      'test 1 asd',
    ]);
    expect(objectArray).toStrictEqual([
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
      { a: 'a' },
    ]);
    const subscribe4 = journaly.subscribe('test2', function4);
    expect(await subscribe4).toStrictEqual([]);
    expect(stringArray).toStrictEqual([
      'test 1 qwe',
      'test 2 asd',
      'test 1 asd',
    ]);
    expect(objectArray).toStrictEqual([
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
      { a: 'a' },
    ]);
    const remaining0 = journaly.unsubscribe('test', function1);
    const remaining1 = journaly.unsubscribe('test', function2);
    const remaining2 = journaly.unsubscribe('test2', function3);
    const remaining3 = journaly.unsubscribe('test2', function4);
    expect(remaining0).toStrictEqual([function2]);
    expect(remaining1).toStrictEqual([]);
    expect(remaining2).toStrictEqual([function4]);
    expect(remaining3).toStrictEqual([]);
    done();
  }
);

test(
  'With Memory: subscribe 2 functions one slow and another fast' +
    ' then subscribe one medium' +
    ' then publish to each then check order',
  async (done) => {
    stringArray = new Array<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectArray = new Array<any>();
    const journaly = new Journaly(true);
    const subscribe1 = journaly.subscribe('test', function1);
    const subscribe2 = journaly.subscribe('test', function2);
    const subscribe3 = journaly.subscribe('test2', function3);

    const subscribes = await Promise.all([subscribe1, subscribe2, subscribe3]);

    expect(subscribes[0]).toStrictEqual([]);
    expect(subscribes[1]).toStrictEqual([]);
    expect(subscribes[2]).toStrictEqual([]);

    const publish1 = journaly.publish('test', { a: 'a' });
    const publish2 = journaly.publish('test2', { a: 'a' }, { b: 'b' });

    const publishes = await Promise.all([publish1, publish2]);

    expect(publishes[0]).toStrictEqual(['1asd', '1qwe']);
    expect(publishes[1]).toStrictEqual(['2asd']);

    expect(stringArray).toStrictEqual([
      'test 1 qwe',
      'test 2 asd',
      'test 1 asd',
    ]);
    expect(objectArray).toStrictEqual([
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
      { a: 'a' },
    ]);
    const subscribe4 = journaly.subscribe('test2', function4);
    expect(await subscribe4).toStrictEqual(['2qwe']);
    expect(stringArray).toStrictEqual([
      'test 1 qwe',
      'test 2 asd',
      'test 1 asd',
      'test 2 qwe',
    ]);
    expect(objectArray).toStrictEqual([
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
    ]);
    const remaining0 = journaly.unsubscribe('test', function1);
    const remaining1 = journaly.unsubscribe('test', function2);
    const remaining2 = journaly.unsubscribe('test2', function3);
    const remaining3 = journaly.unsubscribe('test2', function4);
    expect(remaining0).toStrictEqual([function2]);
    expect(remaining1).toStrictEqual([]);
    expect(remaining2).toStrictEqual([function4]);
    expect(remaining3).toStrictEqual([]);
    done();
  }
);

test(
  'Without Memory: subscribe 2 class functions one slow and another fast' +
    ' then subscribe one medium' +
    ' then publish to each then check order',
  async (done) => {
    stringArray = new Array<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectArray = new Array<any>();
    const journaly = new Journaly<string>();
    const class0 = new Class0();
    const function1Bound = class0.function1.bind(class0);
    const subscribe1 = journaly.subscribe('test', function1Bound);
    const subscribe2 = journaly.subscribe('test', class0.function2);
    const subscribe3 = journaly.subscribe('test2', class0.function3);

    const subscribes = await Promise.all([subscribe1, subscribe2, subscribe3]);

    expect(subscribes[0]).toStrictEqual([]);
    expect(subscribes[1]).toStrictEqual([]);
    expect(subscribes[2]).toStrictEqual([]);

    const publish1 = journaly.publish('test', { a: 'a' });
    const publish2 = journaly.publish('test2', { a: 'a' }, { b: 'b' });

    const publishes = await Promise.all([publish1, publish2]);

    expect(publishes[0]).toStrictEqual(['1asd', '1qwe']);
    expect(publishes[1]).toStrictEqual(['2asd']);

    expect(stringArray).toStrictEqual([
      'test 1 qwe',
      'test 2 asd',
      'test 1 asd',
    ]);
    expect(objectArray).toStrictEqual([
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
      { a: 'a' },
    ]);
    const subscribe4 = journaly.subscribe('test2', class0.function4);
    expect(await subscribe4).toStrictEqual([]);
    expect(stringArray).toStrictEqual([
      'test 1 qwe',
      'test 2 asd',
      'test 1 asd',
    ]);
    expect(objectArray).toStrictEqual([
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
      { a: 'a' },
    ]);
    const remaining0 = journaly.unsubscribe('test', function1Bound);
    const remaining1 = journaly.unsubscribe('test', class0.function2);
    const remaining2 = journaly.unsubscribe('test2', class0.function3);
    const remaining3 = journaly.unsubscribe('test2', class0.function4);
    expect(remaining0).toStrictEqual([class0.function2]);
    expect(remaining1).toStrictEqual([]);
    expect(remaining2).toStrictEqual([class0.function4]);
    expect(remaining3).toStrictEqual([]);
    done();
  }
);

test(
  'With Memory: subscribe 2 class functions one slow and another fast' +
    ' then subscribe one medium' +
    ' then publish to each then check order',
  async (done) => {
    stringArray = new Array<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectArray = new Array<any>();
    const journaly = new Journaly(true);
    const class0 = new Class0();
    const function1Bound = class0.function1.bind(class0);

    const subscribe1 = journaly.subscribe('test', function1Bound);
    const subscribe2 = journaly.subscribe('test', class0.function2);
    const subscribe3 = journaly.subscribe('test2', class0.function3);

    const subscribes = await Promise.all([subscribe1, subscribe2, subscribe3]);

    expect(journaly.getSubjects()).toStrictEqual(['test', 'test2']);

    expect(subscribes[0]).toStrictEqual([]);
    expect(subscribes[1]).toStrictEqual([]);
    expect(subscribes[2]).toStrictEqual([]);

    const publish1 = journaly.publish('test', { a: 'a' });
    const publish2 = journaly.publish('test2', { a: 'a' }, { b: 'b' });

    const publishes = await Promise.all([publish1, publish2]);

    expect(publishes[0]).toStrictEqual(['1asd', '1qwe']);
    expect(publishes[1]).toStrictEqual(['2asd']);

    expect(stringArray).toStrictEqual([
      'test 1 qwe',
      'test 2 asd',
      'test 1 asd',
    ]);
    expect(objectArray).toStrictEqual([
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
      { a: 'a' },
    ]);
    const subscribe4 = journaly.subscribe('test2', class0.function4);
    expect(await subscribe4).toStrictEqual(['2qwe']);
    expect(stringArray).toStrictEqual([
      'test 1 qwe',
      'test 2 asd',
      'test 1 asd',
      'test 2 qwe',
    ]);
    expect(objectArray).toStrictEqual([
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
      { a: 'a' },
      [{ a: 'a' }, { b: 'b' }],
    ]);
    const remaining0 = journaly.unsubscribe('test', function1Bound);
    const remaining1 = journaly.unsubscribe('test', class0.function2);
    const remaining2 = journaly.unsubscribe('test2', class0.function3);
    const remaining3 = journaly.unsubscribe('test2', class0.function4);
    expect(remaining0).toStrictEqual([class0.function2]);
    expect(remaining1).toStrictEqual([]);
    expect(remaining2).toStrictEqual([class0.function4]);
    expect(remaining3).toStrictEqual([]);
    done();
  }
);