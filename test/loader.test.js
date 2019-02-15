
import webpack from './helpers/compiler';

describe('Loader', () => {
  test('Defaults', async () => {
    const config = {
      loader: {
        test: /(ts)/,
        options: {
            name: '[path][name].wasm',
            optimize:"-1",
            validate:true
        }
      },
    };
    const stats = await webpack('fixture.js', config);
    const { source } = stats.toJson().modules[0];
    expect(source).toMatchSnapshot();
  });
});
