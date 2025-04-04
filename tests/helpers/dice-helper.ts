import { type SinonStub, stub } from 'sinon';

/**
 * Get a stub which returns the values passed in as parameters, in order. The
 * stub ignores any input arguments.
 * @param returns the values to return from this stub
 * @returns a sinon stub which returns the values passed as parameters, in order
 */
export function stubReturning<Type>(
  ...returns: Type[]
): SinonStub<unknown[], Type> {
  const fake = stub<unknown[], Type>();
  for (let i = 0; i < returns.length; i++) {
    fake.onCall(i).returns(returns[i]!);
  }

  return fake;
}
