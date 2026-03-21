# 2. webpack 做过哪些优化

**答案：**

**1. 构建速度优化**

```javascript
// webpack.config.js
module.exports = {
  // 缓存
  cache: {
    type: 'filesystem'
  },

  // 缩小构建范围
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },

  // 多进程构建
  parallelism: os.cpus().length - 1,

  // DLL 预编译
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(__dirname, 'dll', '[name]-manifest.json')
    })
  ]
}
```

**2. 打包体积优化**

```javascript
module.exports = {
  // Tree Shaking
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  },

  // 代码分割
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  // 压缩
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  },

  // 按需加载
  plugins: [
    new HtmlWebpackPlugin({
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true
      }
    })
  ]
}
```

**3. 运行时优化**

```javascript
// 路由懒加载
const Home = () => import(/* webpackChunkName: "home" */ './views/Home.vue')

// 组件懒加载
components: {
  HeavyComponent: () => import('./HeavyComponent.vue')
}

// 预加载
const Home = () => import(/* webpackPrefetch: true */ './views/Home.vue')
```

**4. 其他优化**

```javascript
// 图片压缩
module: {
  rules: [
    {
      test: /\.(png|jpe?g|gif|svg)$/,
      use: [
        {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: { progressive: true, quality: 65 },
            optipng: { enabled: false },
            pngquant: { quality: [0.65, 0.9], speed: 4 }
          }
        }
      ]
    }
  ]
}

// 开启 Gzip
const CompressionPlugin = require('compression-webpack-plugin')

plugins: [
  new CompressionPlugin({
    algorithm: 'gzip',
    test: /\.(js|css|html|svg)$/,
    threshold: 10240,
    minRatio: 0.8
  })
]
```

---
