# HONJA 多言語翻字ツール

`こんにちは`　を韓国語に変換すると `콘니치하`　タイ語に変換すると `โคนนิชิฮะ`　

これらは`こんにちは`と発音します。このような音だけを残す文字変換を翻字といいます。

HONJAは多言語でひらがなを翻字できるツールです。


### 動作環境
* Node.js
* npm

### 使い方
| サポートしている言語 |
| ---- |
| Thai |
| Russian |
| Arabic |
| Korean |
| Hindi |
| Tibetan |
| Hebrew |
| Khmer |
| Amharic |
| Tamil |
| Armenian |
| Burmese |
| Greek |
| Georgian |
| Sinhalese |
| Romaji |

**インストール**
```bash
npm install -g TakutoYoshikai/honja
```

**翻字**

ひらがなのみをサポートしています。
```bash
honja Korean "ぼくのなまえはたくとです"
honja Greek "ぼくのなまえはたくとです"
honja Romaji "ぼくのなまえはたくとです"

# まとめて変換
honja All "ぼくのなまえはたくとです"
```

### Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

### License
MIT License
