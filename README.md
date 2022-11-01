# 八百幡コンポーネンツ
XSLT3.0を応用したWeb Components製のプロダクト

## ローカルでのサイト構築の注意点
このリポジトリをローカルで構築する場合は、HTTPサーバのドキュメントルートの直下にフォルダ置いてください。

(DocumentRoot)/components

このリポジトリを直接ドキュメントルートにするとうまく動きません。
アクセスはこのようになります。

http://localhost/components/index.xhtml

## 内容
現在実装中のカスタム要素は、
* i-quote
* twitter-button
* facebook-button
* line-button