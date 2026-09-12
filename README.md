# QuickFire Arena

ブラウザで遊べる、最大8人対応のリアルタイム3D FPSデスマッチのプロトタイプです。プレイヤーは名前を入力してルームを作成するか、5文字のルームコードを使って既存ルームに参加します。ロビーで武器とマップを選択して準備完了にすると、ホストがゲームを開始できます。

- クライアント: <https://quick-fire-arena-client.vercel.app>
- WebSocketサーバー: <https://quickfire-arena.onrender.com>

主な機能は、ルームの作成・参加、最大8人のリアルタイム対戦、武器選択、マップ投票、5分間のデスマッチ、リスポーン、体力回復アイテム、PC操作とWebXRによるVRモードです。

## 使用している主な技術

| 分類 | 技術 | 用途 |
| --- | --- | --- |
| フロントエンド | React 19 / TypeScript | 画面、ロビー、HUDなどのUI |
| 3D描画 | Three.js / React Three Fiber / Drei | ゲーム空間、キャラクター、武器、エフェクトの描画 |
| VR | WebXR | VRモードの表示と入力 |
| ビルド・開発サーバー | Vite 6 | クライアントの開発と本番ビルド |
| バックエンド | Node.js / TypeScript | ルームとゲーム進行の管理 |
| リアルタイム通信 | WebSocket（`ws`） | プレイヤー状態とゲームイベントの同期 |
| パッケージ管理 | npm workspaces | `client` と `server` の依存関係・スクリプト管理 |

## 必要な環境

- Node.js 24以上
- npm
- WebGLに対応したモダンブラウザ
- VRモードを利用する場合は、WebXR対応ブラウザとVRデバイス

## 環境変数

環境変数はどちらも任意です。未設定時はローカル開発用の既定値が使われます。

| 変数 | 対象 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `VITE_WS_URL` | クライアント | `ws://localhost:2567` | 接続先WebSocketサーバーのURL |
| `PORT` | サーバー | `2567` | HTTP/WebSocketサーバーの待受ポート |

クライアントの接続先を変更する場合は、`client/.env.local` を作成します。

```dotenv
VITE_WS_URL=wss://quickfire-arena.onrender.com
```

`VITE_` で始まる値はクライアントのビルド結果に埋め込まれるため、秘密情報を設定しないでください。`PORT` はサーバーの起動時にシェルまたはデプロイ先で設定します。このプロジェクトは `.env` をサーバー側で自動読み込みしません。

```bash
PORT=3000 npm run dev --workspace server
```

## コマンド一覧

リポジトリのルートで実行します。

| コマンド | 内容 |
| --- | --- |
| `npm install` | 全workspaceの依存パッケージをインストール |
| `npm run dev` | クライアントとサーバーを同時に開発モードで起動 |
| `npm run build` | サーバーとクライアントを本番用にビルド |
| `npm run typecheck` | 全workspaceのTypeScript型チェックを実行 |
| `npm run dev --workspace client` | クライアントのみ起動 |
| `npm run dev --workspace server` | サーバーのみ起動（ファイル変更を監視） |
| `npm run start --workspace server` | ビルド済みサーバーを起動 |

## ディレクトリ構成

```text
QuickFire Arena/
├── client/                   # React/Viteクライアント
│   ├── src/
│   │   ├── game/             # 3D描画、操作、武器、マップ、HUD、VR
│   │   │   ├── ads/          # エイム時のオーバーレイ
│   │   │   ├── audio/        # ゲーム音声
│   │   │   ├── effects/      # ダメージ表示などの視覚効果
│   │   │   ├── maps/         # 各マップとマップ定義
│   │   │   ├── props/        # マップ内の3Dオブジェクト
│   │   │   └── ui/           # 対戦中のUI
│   │   ├── screens/          # ロビー、マップ抽選、カウントダウン画面
│   │   ├── ui/               # 武器・マップ・プレイヤー選択UI
│   │   ├── App.tsx           # 接続と画面遷移の起点
│   │   └── main.tsx          # Reactエントリーポイント
│   ├── index.html
│   └── vite.config.ts
├── server/                   # Node.js WebSocketサーバー
│   └── src/
│       ├── rooms/GameRoom.ts # ルーム、試合進行、同期処理
│       ├── index.ts          # HTTP/WebSocketサーバーの起点
│       ├── maps.ts           # マップとスポーン位置
│       ├── weapons.ts        # 武器パラメーター
│       ├── hitboxes.ts       # 当たり判定設定
│       └── types.ts          # 通信メッセージと共有データ型
├── package.json              # workspace共通スクリプト
└── package-lock.json         # 依存バージョンの固定
```

`client/dist/` と `server/dist/` は `npm run build` で生成される成果物です。

## 開発環境の構築方法

1. リポジトリをクローンし、プロジェクトのルートへ移動します。

   ```bash
   git clone <repository-url>
   cd "QuickFire Arena"
   ```

2. 依存パッケージをインストールします。

   ```bash
   npm install
   ```

3. 必要に応じて `client/.env.local` に `VITE_WS_URL` を設定します。ローカルのサーバーへ接続する場合は作成不要です。

4. 開発サーバーを起動します。

   ```bash
   npm run dev
   ```

5. ブラウザで <http://localhost:5173/> を開きます。WebSocketサーバーは `ws://localhost:2567` で待ち受け、<http://localhost:2567/health> で稼働状態を確認できます。

6. 動作確認ではブラウザを2つ開き、一方でルームを作成し、もう一方から表示されたコードで参加します。両プレイヤーが武器とマップを選んで準備完了にすると、ホストが試合を開始できます。

変更をコミットする前に、型チェックと本番ビルドを実行してください。

```bash
npm run typecheck
npm run build
```

## トラブルシューティング

### `Connection closed.` と表示される

- サーバーが起動しているか、<http://localhost:2567/health> を開いて確認してください。
- クライアントとサーバーを別々に起動している場合は、両方のターミナルにエラーがないか確認してください。
- `VITE_WS_URL` を変更した後はViteを再起動してください。
- HTTPSで配信するクライアントからは、ブラウザのMixed Content制限により `ws://` へ接続できません。本番環境では `wss://` のURLを指定してください。

### ポートが使用中で起動できない

サーバーは `PORT` で別のポートに変更できます。その場合はクライアントの接続先も同じポートへ変更します。

```bash
PORT=3000 npm run dev --workspace server
VITE_WS_URL=ws://localhost:3000 npm run dev --workspace client
```

クライアントのポート `5173` が使用中の場合、Viteは利用可能な別ポートを表示します。ターミナルに表示されたURLを開いてください。

### ルームに参加できない、または試合を開始できない

- ルームコードは5文字です。入力値は大文字に変換されます。
- ルームはサーバーのメモリ上にのみ保持されます。サーバーを再起動すると既存のルームは失われます。
- 開始済みのルームには途中参加できません。また、1ルームの上限は8人です。
- 試合開始には2人以上が必要です。全員が武器とマップを選び、準備完了にする必要があります。
- ゲームを開始できるのはホストだけです。

### 画面をクリックしてもPC操作が始まらない

PCモードではPointer Lock APIを使用します。ゲーム画面の開始表示をクリックし、ブラウザのポインター制御を許可してください。`Esc` などで解除した場合は、画面から再開できます。

### VRモードを開始できない

WebXR対応のブラウザとデバイスを使用してください。WebXRは通常、安全なコンテキスト（HTTPS、またはローカルホスト）でのみ利用できます。まずPCモードで描画できることを確認し、その後 `?mode=vr` を付けるかタイトル画面からVRモードを選択してください。

### 依存関係や型エラーが解消しない

Node.jsのバージョンを確認し、リポジトリのルートで依存関係を再インストールしてから型チェックを実行します。

```bash
node --version
npm install
npm run typecheck
```
