请你将下面数组中的每一项进行翻译：

#### 待翻译的列表：

```tsx
【待翻译的列表】
```

#### 返回的数据格式：

```tsx
interface TranslateResult {
  [key: string]: {
    zh: string;
    en: string;
  };
}
```

解释：

- 其中 `key` 就是原来数组中的每一项字符串，`zh`是其对应的中文翻译，`en`是其对应的英文翻译。
- 如果`key`是中文文本，一般来说`zh`就保持和`key`一样就行；
- 如果`key`是英文文本，一般来说 `en` 就保持和`key`一样就行。

注意：请务必确保 `key` 就是原来数组中的每一项字符串。

#### 例子

给你下面的数组：

```tsx
[
  '状态',
  '找不到页面，您可以',
  'http://',
  'IP',
  'Software Reverse Proxy',
  '{param} 为必填项',
  '{param1} [{param3}最后修改时间：{param2}]',
];
```

你只需要返回 Json 格式的数据如下：

```tsx
{
    "{obj}-{app}": {
        "zh": "{obj}-{app}",
        "en": "{obj}-{app}"
    },
    "状态": {
        "zh": "状态",
        "en": "Status"
    },
    "找不到页面，您可以": {
        "zh": "找不到页面，您可以",
        "en": "Page not found, you can"
    },
    "http://": {
        "zh": "http://",
        "en": "http://"
    },
    "IP": {
        "zh": "IP",
        "en": "IP"
    },
    "Software Reverse Proxy": {
        "zh": "反向代理（软件）",
        "en": "Software Reverse Proxy"
    },
    "{param} 为必填项": {
        "zh": "{param} 为必填项",
        "en": "{param} is required"
    },
    "{param1} [{param3}最后修改时间：{param2}]": {
        "zh": "{param1} [{param3}最后修改时间：{param2}]",
        "en": "{param1} [{param3}Last modified time：{param2}]"
    }
}
```

注意：

- 你只需要返回`json`格式的数据即可，就像调用 API 返回结果那样，你不需要将 json 结果包裹在代码块或者 md 中。
