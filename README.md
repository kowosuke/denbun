# { TODO：アプリケーション名を記載 } - GraphQL API

{ TODO：アプリケーション名を記載 } の API(GraphQL)

## 開発環境

### 必須環境

- AWS CLI2
- Node.js version 14.x.x newer
- Java Runtime Engine(JRE) version 8.x or newer
- [watchman](https://facebook.github.io/watchman/docs/install.html)

### 開発環境（インストールなど）

1. git リポジトリのクローン

   ```console
   > git clone https://github.com/hit-ds/{ TODO：リポジトリ名 }.git
   ```

1. node_modules のインストール

   ```console
   > npm install
   ```

1. 「Serverless DynamoDB Local」のインストール

   ```console
   > sls dynamodb install
   ```

   <details>
   <summary>※プロキシ環境下の場合</summary>

   ※プロキシ環境下の場合、インストールに失敗するため手動でインストールする。

   1. DynamoDB Local をダウンロード

      - http://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz

   1. ダウンロードしたファイルを、`./.dynamodb`へ解凍する。

      ```
      .
      └ .dynamodb
         ├ DynamoDBLocal_lib
         ├ DynamoDBLocal.jar
         ├ LICENSE.txt
         ├ README.txt
         └ THIRD-PARTY-LICENSES.txt
      ```

   </details>

### 環境設定（.env）

環境別の設定は`.env`に定義　デフォルト：`dev`

- 開発環境：`.env.dev`
- ステージング環境：`.env.stg`
- 本番環境：`.env.prod`

#### 設定内容

|                         | 設定内容                                         | デフォルト値 |
| ----------------------- | ------------------------------------------------ | ------------ |
| `PROFILE`               | AWS アカウントプロファイル                       | `default`    |
| `WAF_ARN`               | AppSync に適用する WAF の ARN                    |              |
| `CUSTOM_DOMAIN_ACM_ARN` | AppSync のカスタムドメインに使用する証明書の ARN |              |

※ `.env`を Git 管理する場合「API キー」や「シークレットキー」などの機密情報は保持させない

### 起動

#### Appsync Simulator（ローカル開発）

1. npm スクリプトの実行

   ```console
   > npm run offline
   ```

1. GraphiQL（※）を開く

   - http://localhost:20002/

   ※ GraphiQL（グラフィカル）：GraphiQL を実行する GUI ツール

#### DynamoDB Admin

前提：DynamoDB Local が起動済（上記 `npm run offline` 時に起動される）

1. npm スクリプトの事項

   ```console
   > npm run dynamodb:admin
   ```

1. DynamoDB Admin を開く

   - http://localhost:8001

### テスト

1. 静的チェック（`prettier`）

   ```console
   > npm run lint:prettier
   ```

   ※ コードフォーマットに修正箇所がある場合、`npm run fix:prettier`で自動修正可

### デプロイ

前提：デプロイ用の S3 バケットが作成済　※ バケット名：`${self:service}-${self:provider.stage}-sls-deploy`

1. npm スクリプトの実行

   ```
   > sls deploy
   ```

#### カスタムドメインの作成

1. Appsync 上にカスタムドメインを作成

   ```console
   > sls appsync-domain create
   ```

1. カスタムドメインに GraphQL API を紐づけ

   ```console
   > sls appsync-domain assoc
   ```

1. Route53 レコードの作成

   ```console
   > sls appsync-domain create-record
   ```

   <details>
   <summary>※カスタムドメインの消去</summary>

   ```console
   > sls appsync-domain delete-record
   > sls appsync-domain disassoc
   > sls appsync-domain delete
   ```

   </details>

### 開発ツール

#### [GraphQL Code Generator](https://www.the-guild.dev/graphql/codegen/docs/getting-started)

Lambda 関数側で使用する TypeScript 型定義を自動生成

```console
> npm run graphql-codegen
```

- 出力先：`src/types/graphql.ts`
  - 自動フォーマット対象外（`.prettierignore`）
