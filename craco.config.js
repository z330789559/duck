const CracoLessPlugin = require('craco-less')
const path = require('path')
const webpack =require('webpack')
const SimpleProgressWebpackPlugin=require('simple-progress-webpack-plugin')

const RemoveModuleScopePlugin={
  overrideWebpackConfig: ({ webpackConfig, cracoConfig, pluginOptions, context: { env, paths, allowedHost } }) => {
      if (pluginOptions.preText) {
          console.log(pluginOptions.preText);
      }

      console.log(JSON.stringify(webpackConfig, null, 4));

      // Always return the config object.
      return {
        ...webpackConfig,
        resolve: {
          ...webpackConfig.resolve,
          extensions: [
            ...webpackConfig.resolve.extensions,
            '.tsx',
            '.jsx',
            '.ts',
            '.js',
          ],
          plugins: [
            ...webpackConfig.resolve.plugins.filter((t) => {
              // Removes ModuleScopePlugin
              return !Object.keys(t).includes('appSrcs')
            }),
          ],
        },

      };
  }}
const pathResolve = pathUrl => path.join(__dirname, pathUrl)
const dfxJson = require(`${__dirname}/dfx.json`);

const generateAliases = () => {
  const aliases = Object.entries(dfxJson.canisters).reduce(
    (acc, [name, value]) => {
      const outputRoot = path.join(
        __dirname,
        `.dfx/local/${dfxJson.defaults.build.output}`,
        name
      );
      return {
        ...acc,
        ["ic:canisters/" + name]: path.join(outputRoot, name + ".js"),
        ["ic:idl/" + name]: path.join(outputRoot, name + ".did.js"),
      };
    },
    {}
  );
  return aliases;
};
console.log(`${__dirname}/src`)
module.exports = {
  typescript: {
    enableTypeChecking: true /* (default value)  */
},
jest: {
  babel: {
      addPresets: true, /* (default value) */
      addPlugins: true  /* (default value) */
  },
  configure: (jestConfig, { env, paths, resolve, rootDir }) => { 
    jestConfig.moduleFileExtensions=[...jestConfig.moduleFileExtensions, 'ts', 'tsx','js','jsx']
    jestConfig.moduleNameMapper={
      ...jestConfig.moduleNameMapper,
      ...generateAliases()
    }
    return jestConfig; }
},
  webpack: {
    plugins: {
      add:[
          new SimpleProgressWebpackPlugin(),
          new webpack.ProvidePlugin({
            ic: [path.resolve(path.join(__dirname, 'ic.js')), 'ic'],
          })
          ],
          remove: ['ModuleScopePlugin']
        } ,
    alias: {
      ...generateAliases()
      // ?????????????????????????????????????????????????????????
    }
  },
  babel: {
    plugins: [
      ['import', { libraryName: 'antd', style: true }],
      ['@babel/plugin-proposal-decorators', { legacy: true }]
    ]
  },
  plugins: [
    {
      plugin:RemoveModuleScopePlugin,
      options:{}
    },
    {
      plugin: CracoLessPlugin,
      options: {
      	// ???????????? less-loader ????????????????????????????????????????????? less-loader ????????????
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {},
            javascriptEnabled: true
          }
        }
      }
    }
  ]
}

