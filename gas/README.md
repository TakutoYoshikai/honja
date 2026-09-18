# Honja for Google スプレッドシート

Honja の翻字ロジックを Google Apps Script (V8 ランタイム) 用の **1ファイル
(`Honja.gs`)** に移植し、スプレッドシートのカスタム関数として使えるようにしたものです。
このファイル1つを Apps Script プロジェクトに追加するだけで動きます。

`Honja.gs` は `scripts/build-gas.js` が

- `languages/dictionaries/*.dict.js` (辞書データ)
- `languages/*.js` (言語設定)
- `scripts/gas-core.js` (`onbiki.js` / `number/index.js` / `language.js` /
  `transliterator.js` / `index.js` を Apps Script 用に手作業で移植したロジック)

を1つに結合して自動生成したものなので、**`gas/Honja.gs` は直接編集しないでください**。
辞書を更新したい場合はリポジトリ側のファイルか `scripts/gas-core.js` を直し、
プロジェクトルートで以下を実行して再生成してください。

```bash
npm run build:gas
```

## 使える関数

| 関数 | 説明 |
| --- | --- |
| `=HONJA(text, language)` | `text` (ひらがな・カタカナ) を `language` で指定した言語の発音表記に翻字します。セル範囲を渡すこともできます。 |
| `=HONJA_ALL(text)` | 対応している全言語への翻字結果を、言語名の行と結果の行の2行の表として返します(スピル表示)。 |
| `=HONJA_LANGUAGES()` | `HONJA` の `language` に指定できる言語名の一覧を返します。 |

対応言語: Thai, Russian, Arabic, Korean, Hindi, Tibetan, Hebrew, Khmer, Amharic,
Tamil, Armenian, Burmese, Greek, Georgian, Sinhalese, Romaji, Hiragana

### 使用例

```
=HONJA("こんにちは", "Korean")     -> 콘니치하
=HONJA("こんにちは", "Thai")       -> โคนนิชิฮะ
=HONJA(A1:A10, "Romaji")          -> A1:A10 を1行ずつローマ字に変換
=HONJA_ALL("こんにちは")           -> 言語名の行 / 翻字結果の行 の2行を返す
```

## デプロイ方法

### スプレッドシートに直接コピペ (これだけでOK)

1. 変換したいスプレッドシートを開き、「拡張機能」→「Apps Script」を選択。
2. デフォルトで作られる `コード.gs` の中身を全て削除し、
   `gas/Honja.gs` の中身をまるごとコピペします。
3. 保存すると、スプレッドシートのセルで `=HONJA(...)` などが使えるようになります。

### clasp を使う場合

```bash
npm install -g @google/clasp
clasp login
cd gas
clasp create --type sheets --title "Honja"
clasp push
```

既存のスプレッドシートに紐づけたい場合は `clasp create` の代わりに、
対象スプレッドシートの Apps Script プロジェクトの スクリプトID を
`.clasp.json` の `scriptId` に設定してから `clasp push` してください
(`gas/` フォルダには `Honja.gs` 1つしかないので、そのまま push すれば1ファイルだけ追加されます)。

## 移植にあたって直した点

原作 (npm パッケージ `honja` / `number/index.js` `transliterator.js`) をそのまま
Apps Script に置き換えると、以下の2点は**そのままだと壊れる/意図通りに動かない**ため、
出力を変えずに直せる範囲で修正して移植しています。

1. `numberToTsu` が未定義の変数 `n` を参照していて、半角数字のすぐ後に
   「つ」が続く文字列 (例: `"3つ"`) を変換すると必ず例外になっていました。
   引数をそのまま参照するように修正しています(例: `"3つ" -> "みっつ"`)。
2. 上記1の副作用で、数値がちょうど `"0"` のとき (`"0つ"` など) も
   同じ理由で例外になっていたところを、`"ぜろ"` として扱うように
   ついでに直しています。

それ以外の挙動 (`は`/`へ`/`を` の助詞変換、長音「ー」の展開、Thai/Korean 用の
「additional」辞書が実際には参照されない、など原作の細かい癖を含む) は
テストで原作の出力と完全一致することを確認した上でそのまま移植しています。
