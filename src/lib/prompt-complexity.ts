/**
 * 🧠 Intelligent Prompt Complexity Analyzer
 * 
 * Multi-language support with contextual pattern matching and automatic trigger detection.
 * Supports: Russian, English, Ukrainian, Spanish, German, French, Portuguese, Chinese, Japanese, Korean, Arabic, Turkish
 */

export type ComplexityLevel = 'low' | 'medium' | 'high';

interface AnalysisResult {
  complexity: ComplexityLevel;
  matchedCategories: string[];
  contextBoosts: string[];
  confidence: number;
  detectedLanguage: string;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MULTILINGUAL HIGH COMPLEXITY TRIGGERS (~150+ patterns across 12 languages)
// → Orchestrated Multi-Agent Pipeline (Opus + Sonnet + Haiku)
// ═══════════════════════════════════════════════════════════════════════════════════════

const HIGH_PATTERNS: Record<string, RegExp[]> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // API & INTEGRATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  api_integrations: [
    // Universal / Technical
    /\bapi\b/i, /rest\s*api/i, /graphql/i, /grpc/i, /soap/i,
    /webhook/i, /oauth/i, /sso\b/i, /saml/i, /openid/i,
    /sdk\b/i, /endpoint/i, /microservice/i, /backend/i,
    // Russian
    /интеграци/i, /вебхук/i, /эндпоинт/i, /микросервис/i, /бэкенд/i, /библиотек/i,
    // Ukrainian
    /інтеграці/i, /вебхук/i, /мікросервіс/i, /бекенд/i,
    // Spanish
    /integración/i, /punto\s*final/i, /microservicio/i,
    // German
    /schnittstelle/i, /integration/i, /endpunkt/i,
    // French
    /intégration/i, /point\s*de\s*terminaison/i,
    // Portuguese
    /integração/i, /ponto\s*de\s*extremidade/i,
    // Chinese
    /接口/i, /集成/i, /微服务/i, /后端/i,
    // Japanese
    /統合/i, /エンドポイント/i, /マイクロサービス/i,
    // Korean
    /통합/i, /엔드포인트/i, /마이크로서비스/i,
    // Turkish
    /entegrasyon/i, /uç\s*nokta/i,
    // Arabic
    /تكامل/i, /واجهة برمجة/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // DATABASE & STORAGE
  // ═══════════════════════════════════════════════════════════════════════════
  database: [
    // Technical / Brand names
    /database/i, /\bdb\b/i, /supabase/i, /firebase/i, /mongodb/i,
    /postgres/i, /mysql/i, /sqlite/i, /redis/i, /elastic/i,
    /dynamodb/i, /cassandra/i, /neo4j/i, /prisma/i,
    /\bsql\b/i, /nosql/i, /\borm\b/i, /query/i,
    /migration/i, /schema/i, /crud\b/i, /replication/i,
    /backup/i, /\bindex/i,
    // Russian
    /база\s*данных/i, /хранилищ/i, /миграци/i, /схем[аы]/i,
    /репликаци/i, /бэкап/i, /резерв.*коп/i, /индекс/i, /запрос/i,
    // Ukrainian
    /база\s*даних/i, /сховище/i, /міграці/i, /схема/i, /резервн/i,
    // Spanish
    /base\s*de\s*datos/i, /almacenamiento/i, /migración/i, /esquema/i,
    // German
    /datenbank/i, /speicher/i, /migration/i, /schema/i, /sicherung/i,
    // French
    /base\s*de\s*données/i, /stockage/i, /migration/i, /schéma/i, /sauvegarde/i,
    // Portuguese
    /banco\s*de\s*dados/i, /armazenamento/i, /migração/i,
    // Chinese
    /数据库/i, /存储/i, /迁移/i, /模式/i, /备份/i, /查询/i,
    // Japanese
    /データベース/i, /ストレージ/i, /マイグレーション/i, /スキーマ/i,
    // Korean
    /데이터베이스/i, /저장소/i, /마이그레이션/i, /스키마/i,
    // Turkish
    /veritabanı/i, /depolama/i, /yedekleme/i,
    // Arabic
    /قاعدة بيانات/i, /تخزين/i, /نسخ احتياطي/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHENTICATION & SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  authentication: [
    // Technical
    /auth\b/i, /login/i, /logout/i, /sign.?in/i, /sign.?up/i,
    /password/i, /credential/i, /token/i, /jwt\b/i, /session/i,
    /role/i, /permission/i, /rbac/i, /acl\b/i, /access.?control/i,
    /2fa\b/i, /mfa\b/i, /totp/i, /otp\b/i,
    /encrypt/i, /decrypt/i, /hash/i, /salt/i,
    /security/i, /captcha/i, /recaptcha/i,
    // Russian
    /авториза/i, /аутентифик/i, /регистраци/i, /пароль/i, /токен/i,
    /роли/i, /права/i, /доступ/i, /двухфактор/i, /шифрован/i,
    /безопасност/i, /защит/i, /каптча/i, /вход/i, /выход/i,
    // Ukrainian
    /авторизаці/i, /автентифікаці/i, /реєстраці/i, /пароль/i,
    /дозвіл/i, /доступ/i, /шифруван/i, /безпек/i,
    // Spanish
    /autenticación/i, /autorización/i, /contraseña/i, /registro/i,
    /permisos/i, /seguridad/i, /cifrado/i, /iniciar\s*sesión/i,
    // German
    /authentifizierung/i, /autorisierung/i, /passwort/i, /registrierung/i,
    /berechtigung/i, /sicherheit/i, /verschlüsselung/i, /anmeldung/i,
    // French
    /authentification/i, /autorisation/i, /mot\s*de\s*passe/i, /inscription/i,
    /permission/i, /sécurité/i, /chiffrement/i, /connexion/i,
    // Portuguese
    /autenticação/i, /autorização/i, /senha/i, /cadastro/i,
    /permissão/i, /segurança/i, /criptografia/i,
    // Chinese
    /认证/i, /授权/i, /密码/i, /注册/i, /登录/i, /登出/i,
    /权限/i, /安全/i, /加密/i, /验证码/i,
    // Japanese
    /認証/i, /認可/i, /パスワード/i, /登録/i, /ログイン/i, /ログアウト/i,
    /権限/i, /セキュリティ/i, /暗号化/i,
    // Korean
    /인증/i, /권한/i, /비밀번호/i, /회원가입/i, /로그인/i, /로그아웃/i,
    /보안/i, /암호화/i,
    // Turkish
    /kimlik\s*doğrulama/i, /şifre/i, /kayıt/i, /giriş/i, /güvenlik/i,
    // Arabic
    /مصادقة/i, /تسجيل دخول/i, /كلمة مرور/i, /أمان/i, /تشفير/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // PAYMENTS & FINANCE
  // ═══════════════════════════════════════════════════════════════════════════
  payments: [
    // Technical / Brand names
    /payment/i, /stripe/i, /paypal/i, /braintree/i, /square/i,
    /subscription/i, /recurring/i, /billing/i, /invoice/i,
    /transaction/i, /refund/i, /chargeback/i, /payout/i,
    /wallet/i, /balance/i, /credit\s*card/i, /debit/i,
    /crypto/i, /blockchain/i, /web3/i, /nft/i, /defi/i,
    /smart\s*contract/i, /ethereum/i, /bitcoin/i, /solana/i,
    // Russian
    /платеж/i, /оплат/i, /подписк/i, /биллинг/i, /счет/i,
    /инвойс/i, /накладн/i, /транзакци/i, /возврат/i,
    /кошелек/i, /баланс/i, /крипто/i, /блокчейн/i,
    /смарт.?контракт/i, /банк/i, /финанс/i, /тинькофф/i, /сбер/i,
    // Ukrainian
    /платіж/i, /оплат/i, /підписк/i, /рахунок/i, /транзакці/i,
    /повернення/i, /гаманець/i, /баланс/i, /крипт/i, /банк/i, /фінанс/i,
    // Spanish
    /pago/i, /suscripción/i, /factura/i, /transacción/i, /reembolso/i,
    /billetera/i, /saldo/i, /tarjeta/i, /banco/i, /finanzas/i,
    // German
    /zahlung/i, /abonnement/i, /rechnung/i, /transaktion/i, /erstattung/i,
    /geldbörse/i, /guthaben/i, /bank/i, /finanzen/i,
    // French
    /paiement/i, /abonnement/i, /facture/i, /transaction/i, /remboursement/i,
    /portefeuille/i, /solde/i, /banque/i, /finances/i,
    // Portuguese
    /pagamento/i, /assinatura/i, /fatura/i, /transação/i, /reembolso/i,
    /carteira/i, /saldo/i, /banco/i, /finanças/i,
    // Chinese
    /支付/i, /付款/i, /订阅/i, /账单/i, /发票/i, /交易/i,
    /退款/i, /钱包/i, /余额/i, /加密货币/i, /银行/i, /金融/i,
    // Japanese
    /支払い/i, /決済/i, /サブスクリプション/i, /請求/i, /取引/i,
    /返金/i, /ウォレット/i, /残高/i, /銀行/i, /金融/i,
    // Korean
    /결제/i, /구독/i, /청구/i, /거래/i, /환불/i,
    /지갑/i, /잔액/i, /은행/i, /금융/i, /암호화폐/i,
    // Turkish
    /ödeme/i, /abonelik/i, /fatura/i, /işlem/i, /iade/i,
    /cüzdan/i, /bakiye/i, /banka/i, /finans/i,
    // Arabic
    /دفع/i, /اشتراك/i, /فاتورة/i, /معاملة/i, /استرداد/i,
    /محفظة/i, /رصيد/i, /بنك/i, /مالية/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // E-COMMERCE
  // ═══════════════════════════════════════════════════════════════════════════
  ecommerce: [
    // Technical
    /e.?commerce/i, /shop\b/i, /store\b/i, /marketplace/i,
    /catalog/i, /inventory/i, /cart\b/i, /checkout/i, /basket/i,
    /order/i, /shipping/i, /delivery/i, /tracking/i,
    /warehouse/i, /stock/i, /sku\b/i, /product/i,
    /discount/i, /promo/i, /coupon/i, /voucher/i, /wishlist/i,
    // Russian
    /магазин/i, /маркетплейс/i, /каталог/i, /инвентар/i, /корзин/i,
    /оформлен.*заказ/i, /заказ/i, /доставк/i, /отслежив/i, /трекинг/i,
    /склад/i, /наличи/i, /товар/i, /скидк/i, /промокод/i,
    /купон/i, /избранн/i, /витрин/i,
    // Ukrainian
    /магазин/i, /каталог/i, /кошик/i, /замовлен/i, /доставк/i,
    /склад/i, /товар/i, /знижк/i, /промокод/i,
    // Spanish
    /tienda/i, /catálogo/i, /carrito/i, /pedido/i, /envío/i, /entrega/i,
    /almacén/i, /producto/i, /descuento/i, /cupón/i,
    // German
    /geschäft/i, /laden/i, /katalog/i, /warenkorb/i, /bestellung/i,
    /versand/i, /lieferung/i, /lager/i, /produkt/i, /rabatt/i, /gutschein/i,
    // French
    /boutique/i, /magasin/i, /catalogue/i, /panier/i, /commande/i,
    /livraison/i, /entrepôt/i, /produit/i, /réduction/i, /coupon/i,
    // Portuguese
    /loja/i, /catálogo/i, /carrinho/i, /pedido/i, /entrega/i,
    /estoque/i, /produto/i, /desconto/i, /cupom/i,
    // Chinese
    /商店/i, /电商/i, /目录/i, /购物车/i, /结账/i, /订单/i,
    /发货/i, /配送/i, /仓库/i, /库存/i, /产品/i, /折扣/i, /优惠券/i,
    // Japanese
    /ショップ/i, /店舗/i, /カタログ/i, /カート/i, /注文/i,
    /配送/i, /在庫/i, /商品/i, /割引/i, /クーポン/i,
    // Korean
    /쇼핑몰/i, /카탈로그/i, /장바구니/i, /주문/i, /배송/i,
    /재고/i, /상품/i, /할인/i, /쿠폰/i,
    // Turkish
    /mağaza/i, /katalog/i, /sepet/i, /sipariş/i, /teslimat/i,
    /depo/i, /ürün/i, /indirim/i, /kupon/i,
    // Arabic
    /متجر/i, /كتالوج/i, /سلة/i, /طلب/i, /توصيل/i,
    /مخزن/i, /منتج/i, /خصم/i, /قسيمة/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN & DASHBOARDS
  // ═══════════════════════════════════════════════════════════════════════════
  admin_dashboards: [
    // Technical
    /admin/i, /dashboard/i, /cms\b/i, /content\s*management/i,
    /back.?office/i, /control\s*panel/i, /moderation/i,
    /analytics/i, /metric/i, /report/i, /statistic/i,
    /audit/i, /logging/i, /monitor/i,
    // Russian
    /админ/i, /дашборд/i, /панел/i, /бэк.?офис/i,
    /модераци/i, /аналитик/i, /метрик/i, /отчет/i, /статистик/i,
    /аудит/i, /логирован/i, /мониторинг/i,
    // Ukrainian
    /адмін/i, /панель/i, /модераці/i, /аналітик/i, /звіт/i, /статистик/i,
    // Spanish
    /administrador/i, /panel\s*de\s*control/i, /moderación/i,
    /analítica/i, /informe/i, /estadística/i,
    // German
    /administrator/i, /kontrollzentrum/i, /moderation/i,
    /analytik/i, /bericht/i, /statistik/i,
    // French
    /administrateur/i, /tableau\s*de\s*bord/i, /modération/i,
    /analytique/i, /rapport/i, /statistique/i,
    // Portuguese
    /administrador/i, /painel/i, /moderação/i,
    /analítica/i, /relatório/i, /estatística/i,
    // Chinese
    /管理/i, /管理员/i, /仪表板/i, /控制面板/i, /后台/i,
    /审核/i, /分析/i, /报告/i, /统计/i, /监控/i,
    // Japanese
    /管理者/i, /管理画面/i, /ダッシュボード/i, /モデレーション/i,
    /分析/i, /レポート/i, /統計/i,
    // Korean
    /관리자/i, /대시보드/i, /제어판/i, /관리/i,
    /분석/i, /보고서/i, /통계/i,
    // Turkish
    /yönetici/i, /kontrol\s*paneli/i, /moderasyon/i,
    /analitik/i, /rapor/i, /istatistik/i,
    // Arabic
    /مشرف/i, /لوحة تحكم/i, /إشراف/i, /تحليلات/i, /تقرير/i, /إحصائيات/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // REAL-TIME & COMMUNICATION
  // ═══════════════════════════════════════════════════════════════════════════
  realtime: [
    // Technical
    /real.?time/i, /websocket/i, /socket\.io/i, /\bws\b/i, /sse\b/i,
    /push\s*notification/i, /live\s*update/i, /streaming/i,
    /chat\b/i, /messag/i, /inbox/i, /conversation/i,
    /notification/i, /alert/i, /email/i, /smtp/i, /sendgrid/i,
    /mailgun/i, /postmark/i, /sms\b/i, /twilio/i, /whatsapp/i,
    /telegram\s*bot/i, /video\s*call/i, /webrtc/i, /voip/i,
    /broadcast/i, /channel/i, /subscribe/i, /publish/i,
    // Russian
    /реал.?тайм/i, /чат/i, /сообщен/i, /мессендж/i, /переписк/i,
    /уведомлен/i, /оповещен/i, /почт/i, /рассылк/i,
    /видео.?звон/i, /стрим/i, /трансляц/i, /канал/i,
    // Ukrainian
    /реальн.*час/i, /чат/i, /повідомлен/i, /сповіщен/i,
    /пошт/i, /розсилк/i, /відео.*дзвін/i, /трансляці/i,
    // Spanish
    /tiempo\s*real/i, /mensaje/i, /notificación/i, /correo/i,
    /videollamada/i, /transmisión/i,
    // German
    /echtzeit/i, /nachricht/i, /benachrichtigung/i, /e-mail/i,
    /videoanruf/i, /übertragung/i,
    // French
    /temps\s*réel/i, /message/i, /notification/i, /courriel/i,
    /appel\s*vidéo/i, /diffusion/i,
    // Portuguese
    /tempo\s*real/i, /mensagem/i, /notificação/i, /e-mail/i,
    /chamada\s*de\s*vídeo/i, /transmissão/i,
    // Chinese
    /实时/i, /即时/i, /聊天/i, /消息/i, /通知/i, /提醒/i,
    /邮件/i, /视频通话/i, /直播/i, /频道/i,
    // Japanese
    /リアルタイム/i, /チャット/i, /メッセージ/i, /通知/i,
    /メール/i, /ビデオ通話/i, /配信/i, /チャンネル/i,
    // Korean
    /실시간/i, /채팅/i, /메시지/i, /알림/i,
    /이메일/i, /영상통화/i, /방송/i, /채널/i,
    // Turkish
    /gerçek\s*zamanlı/i, /sohbet/i, /mesaj/i, /bildirim/i,
    /e-posta/i, /görüntülü\s*arama/i, /yayın/i,
    // Arabic
    /وقت حقيقي/i, /دردشة/i, /رسالة/i, /إشعار/i,
    /بريد إلكتروني/i, /مكالمة فيديو/i, /بث/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTERPRISE & SAAS
  // ═══════════════════════════════════════════════════════════════════════════
  enterprise: [
    // Technical
    /\bcrm\b/i, /\berp\b/i, /\bsaas\b/i, /\bb2b\b/i, /\bb2c\b/i,
    /enterprise/i, /tenant/i, /multi.?tenant/i, /white.?label/i,
    /workspace/i, /organization/i, /team/i, /collaborate/i,
    /license/i, /quota/i, /usage\s*limit/i, /tier/i, /plan/i,
    // Russian
    /мультитенант/i, /вайт.?лейбл/i, /воркспейс/i, /рабоч.*простран/i,
    /организаци/i, /команд/i, /коллаборац/i, /совместн/i,
    /лицензи/i, /тариф/i, /квот/i, /лимит/i,
    // Ukrainian
    /мультитенант/i, /робоч.*простір/i, /організаці/i, /команд/i,
    /ліцензі/i, /тариф/i, /ліміт/i,
    // Spanish
    /multiinquilino/i, /espacio\s*de\s*trabajo/i, /organización/i, /equipo/i,
    /licencia/i, /tarifa/i, /límite/i,
    // German
    /mandantenfähig/i, /arbeitsbereich/i, /organisation/i, /team/i,
    /lizenz/i, /tarif/i, /limit/i,
    // French
    /multi-locataire/i, /espace\s*de\s*travail/i, /organisation/i, /équipe/i,
    /licence/i, /tarif/i, /limite/i,
    // Portuguese
    /multi-inquilino/i, /espaço\s*de\s*trabalho/i, /organização/i, /equipe/i,
    /licença/i, /tarifa/i, /limite/i,
    // Chinese
    /多租户/i, /工作区/i, /组织/i, /团队/i, /协作/i,
    /许可证/i, /配额/i, /限制/i, /套餐/i,
    // Japanese
    /マルチテナント/i, /ワークスペース/i, /組織/i, /チーム/i, /コラボレーション/i,
    /ライセンス/i, /プラン/i,
    // Korean
    /멀티테넌트/i, /워크스페이스/i, /조직/i, /팀/i, /협업/i,
    /라이선스/i, /요금제/i, /한도/i,
    // Turkish
    /çoklu\s*kiracı/i, /çalışma\s*alanı/i, /organizasyon/i, /ekip/i,
    /lisans/i, /tarife/i, /limit/i,
    // Arabic
    /متعدد المستأجرين/i, /مساحة عمل/i, /منظمة/i, /فريق/i,
    /رخصة/i, /خطة/i, /حد/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // INFRASTRUCTURE & DEVOPS
  // ═══════════════════════════════════════════════════════════════════════════
  infrastructure: [
    // Technical
    /deploy/i, /docker/i, /kubernetes/i, /\bk8s\b/i, /container/i,
    /ci.?cd/i, /pipeline/i, /github\s*action/i, /gitlab/i, /jenkins/i,
    /serverless/i, /lambda/i, /edge\s*function/i, /vercel/i, /netlify/i,
    /\bcdn\b/i, /cloudflare/i, /\baws\b/i, /\bgcp\b/i, /azure/i,
    /domain/i, /\bdns\b/i, /\bssl\b/i, /\btls\b/i, /certificate/i,
    /monitoring/i, /alerting/i, /observability/i, /grafana/i, /prometheus/i,
    /cron/i, /scheduler/i, /queue/i, /worker/i, /job/i,
    /load\s*balanc/i, /scaling/i, /auto.?scale/i,
    // Russian
    /деплой/i, /развертыван/i, /контейнер/i, /оркестраци/i,
    /автоматизац/i, /домен/i, /сертификат/i, /мониторинг/i,
    /очеред/i, /планировщик/i, /воркер/i, /балансировк/i, /масштабирован/i,
    // Ukrainian
    /розгортання/i, /контейнер/i, /автоматизаці/i, /домен/i,
    /сертифікат/i, /моніторинг/i, /черга/i, /масштабуван/i,
    // Spanish
    /despliegue/i, /contenedor/i, /automatización/i, /dominio/i,
    /certificado/i, /monitoreo/i, /cola/i, /escalado/i,
    // German
    /bereitstellung/i, /container/i, /automatisierung/i, /domäne/i,
    /zertifikat/i, /überwachung/i, /warteschlange/i, /skalierung/i,
    // French
    /déploiement/i, /conteneur/i, /automatisation/i, /domaine/i,
    /certificat/i, /surveillance/i, /file\s*d'attente/i, /mise\s*à\s*l'échelle/i,
    // Portuguese
    /implantação/i, /contêiner/i, /automação/i, /domínio/i,
    /certificado/i, /monitoramento/i, /fila/i, /escalabilidade/i,
    // Chinese
    /部署/i, /容器/i, /自动化/i, /域名/i, /证书/i,
    /监控/i, /队列/i, /负载均衡/i, /扩展/i,
    // Japanese
    /デプロイ/i, /コンテナ/i, /自動化/i, /ドメイン/i, /証明書/i,
    /モニタリング/i, /キュー/i, /スケーリング/i,
    // Korean
    /배포/i, /컨테이너/i, /자동화/i, /도메인/i, /인증서/i,
    /모니터링/i, /큐/i, /확장/i,
    // Turkish
    /dağıtım/i, /konteyner/i, /otomasyon/i, /alan\s*adı/i, /sertifika/i,
    /izleme/i, /kuyruk/i, /ölçekleme/i,
    // Arabic
    /نشر/i, /حاوية/i, /أتمتة/i, /نطاق/i, /شهادة/i,
    /مراقبة/i, /طابور/i, /توسيع/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPLEX FEATURES
  // ═══════════════════════════════════════════════════════════════════════════
  complex_features: [
    // Technical
    /multi.?page/i, /\bspa\b/i, /routing/i, /navigation/i,
    /\bi18n\b/i, /localization/i, /translation/i, /\brtl\b/i,
    /a.?b\s*test/i, /experiment/i, /feature\s*flag/i, /rollout/i,
    /personalization/i, /recommendation/i, /machine\s*learning/i,
    /\bml\b/i, /\bai\b/i, /neural/i, /nlp\b/i, /computer\s*vision/i,
    /import/i, /export/i, /\bcsv\b/i, /excel/i, /\bpdf\b/i,
    /\bqr\b/i, /barcode/i, /scan/i,
    /\bmap\b/i, /geolocation/i, /\bgps\b/i, /location/i,
    /calendar/i, /schedule/i, /booking/i, /reservation/i, /appointment/i,
    /search\s*engine/i, /full.?text/i, /elasticsearch/i, /algolia/i,
    // Russian
    /многостранич/i, /маршрутизац/i, /навигац/i,
    /локализаци/i, /перевод/i, /мультиязыч/i,
    /эксперимент/i, /тестирован/i, /флаг.*функц/i,
    /персонализац/i, /рекомендаци/i, /нейросет/i,
    /машин.*обучен/i, /искусствен.*интеллект/i,
    /импорт/i, /экспорт/i, /парс/i, /генераци.*документ/i,
    /штрих.?код/i, /сканирован/i,
    /карт[аы]/i, /геолокац/i, /местоположен/i,
    /календар/i, /расписан/i, /бронирован/i, /запис.*приём/i,
    /поисков.*движ/i, /полнотекст/i,
    // Ukrainian
    /багатосторінков/i, /маршрутизаці/i, /навігаці/i,
    /локалізаці/i, /переклад/i, /рекомендаці/i, /нейромереж/i,
    /імпорт/i, /експорт/i, /карт/i, /геолокаці/i,
    /календар/i, /розклад/i, /бронюван/i,
    // Spanish
    /multipágina/i, /enrutamiento/i, /navegación/i,
    /localización/i, /traducción/i, /recomendación/i, /red\s*neuronal/i,
    /importar/i, /exportar/i, /mapa/i, /geolocalización/i,
    /calendario/i, /horario/i, /reserva/i, /cita/i,
    // German
    /mehrseitig/i, /routing/i, /navigation/i,
    /lokalisierung/i, /übersetzung/i, /empfehlung/i, /neuronales\s*netz/i,
    /importieren/i, /exportieren/i, /karte/i, /standort/i,
    /kalender/i, /zeitplan/i, /buchung/i, /termin/i,
    // French
    /multipage/i, /routage/i, /navigation/i,
    /localisation/i, /traduction/i, /recommandation/i, /réseau\s*neuronal/i,
    /importer/i, /exporter/i, /carte/i, /géolocalisation/i,
    /calendrier/i, /planning/i, /réservation/i, /rendez-vous/i,
    // Chinese
    /多页/i, /路由/i, /导航/i, /本地化/i, /翻译/i,
    /推荐/i, /神经网络/i, /机器学习/i, /人工智能/i,
    /导入/i, /导出/i, /二维码/i, /条形码/i,
    /地图/i, /定位/i, /日历/i, /日程/i, /预约/i, /预订/i,
    // Japanese
    /マルチページ/i, /ルーティング/i, /ナビゲーション/i,
    /ローカライゼーション/i, /翻訳/i, /レコメンド/i, /ニューラル/i,
    /インポート/i, /エクスポート/i, /マップ/i, /位置情報/i,
    /カレンダー/i, /スケジュール/i, /予約/i,
    // Korean
    /멀티페이지/i, /라우팅/i, /네비게이션/i,
    /현지화/i, /번역/i, /추천/i, /신경망/i, /머신러닝/i,
    /가져오기/i, /내보내기/i, /지도/i, /위치/i,
    /캘린더/i, /일정/i, /예약/i,
    // Turkish
    /çok\s*sayfalı/i, /yönlendirme/i, /navigasyon/i,
    /yerelleştirme/i, /çeviri/i, /öneri/i, /yapay\s*zeka/i,
    /içe\s*aktar/i, /dışa\s*aktar/i, /harita/i, /konum/i,
    /takvim/i, /program/i, /rezervasyon/i, /randevu/i,
    // Arabic
    /متعدد الصفحات/i, /توجيه/i, /ملاحة/i,
    /تعريب/i, /ترجمة/i, /توصية/i, /ذكاء اصطناعي/i,
    /استيراد/i, /تصدير/i, /خريطة/i, /موقع/i,
    /تقويم/i, /جدول/i, /حجز/i, /موعد/i,
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// MULTILINGUAL MEDIUM COMPLEXITY TRIGGERS (~80+ patterns)
// → Agent Loop (Sonnet)
// ═══════════════════════════════════════════════════════════════════════════════════════

const MEDIUM_PATTERNS: Record<string, RegExp[]> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // FORMS & INPUTS
  // ═══════════════════════════════════════════════════════════════════════════
  forms: [
    // Technical
    /\bform\b/i, /\binput\b/i, /validation/i, /autocomplete/i,
    /dropdown/i, /\bselect\b/i, /checkbox/i, /radio\s*button/i,
    /date.?picker/i, /time.?picker/i, /color.?picker/i,
    /file\s*upload/i, /drag.?drop/i, /wysiwyg/i, /rich\s*text/i,
    /multi.?step/i, /wizard/i,
    // Russian
    /форм[аы]/i, /поле/i, /ввод/i, /валидаци/i, /провер/i,
    /автозаполнен/i, /выпадающ/i, /переключател/i,
    /выбор.*дат/i, /загрузк.*файл/i, /перетаскиван/i, /редактор/i,
    // Ukrainian
    /форм/i, /поле/i, /введення/i, /валідаці/i, /перевірк/i,
    /завантажен.*файл/i, /перетягуван/i,
    // Spanish
    /formulario/i, /campo/i, /validación/i, /carga\s*de\s*archivos/i,
    // German
    /formular/i, /eingabefeld/i, /validierung/i, /datei.?upload/i,
    // French
    /formulaire/i, /champ/i, /validation/i, /téléchargement/i,
    // Chinese
    /表单/i, /输入/i, /验证/i, /上传/i, /拖放/i,
    // Japanese
    /フォーム/i, /入力/i, /バリデーション/i, /アップロード/i,
    // Korean
    /양식/i, /입력/i, /유효성 검사/i, /업로드/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATIONS & EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════
  animations: [
    // Technical
    /animation/i, /animate/i, /transition/i, /\bhover\b/i,
    /parallax/i, /scroll.*effect/i, /fade/i, /blur/i,
    /skeleton/i, /shimmer/i, /loading/i, /spinner/i,
    /confetti/i, /particle/i, /\b3d\b/i, /three\.?js/i, /webgl/i,
    /lottie/i, /rive/i, /framer/i, /motion/i, /gsap/i,
    // Russian
    /анимаци/i, /переход/i, /наведен/i, /параллакс/i, /эффект.*скролл/i,
    /размыт/i, /скелетон/i, /загрузк/i, /спиннер/i, /частиц/i,
    // Ukrainian
    /анімаці/i, /перехід/i, /наведення/i, /паралакс/i, /завантажен/i,
    // Spanish
    /animación/i, /transición/i, /efecto/i, /cargando/i,
    // German
    /animation/i, /übergang/i, /effekt/i, /laden/i,
    // French
    /animation/i, /transition/i, /effet/i, /chargement/i,
    // Chinese
    /动画/i, /过渡/i, /效果/i, /加载/i, /粒子/i,
    // Japanese
    /アニメーション/i, /トランジション/i, /エフェクト/i, /ローディング/i,
    // Korean
    /애니메이션/i, /전환/i, /효과/i, /로딩/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA VISUALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  data_viz: [
    // Technical
    /chart/i, /graph\b/i, /diagram/i, /\bpie\b/i, /\bbar\b/i,
    /\bline\s*chart/i, /\barea\b/i, /scatter/i, /bubble/i,
    /\btable\b/i, /\bgrid\b/i, /data\s*table/i, /sort/i,
    /pagination/i, /progress/i, /indicator/i, /timeline/i,
    /kanban/i, /tree\s*view/i, /hierarchy/i, /recharts/i, /d3/i,
    // Russian
    /график/i, /диаграмм/i, /таблиц/i, /сортировк/i,
    /пагинаци/i, /прогресс/i, /индикатор/i, /таймлайн/i, /канбан/i,
    /дерев.*структур/i,
    // Ukrainian
    /графік/i, /діаграм/i, /таблиц/i, /сортуван/i, /пагінаці/i,
    // Spanish
    /gráfico/i, /diagrama/i, /tabla/i, /ordenar/i, /paginación/i,
    // German
    /diagramm/i, /tabelle/i, /sortieren/i, /paginierung/i,
    // French
    /graphique/i, /diagramme/i, /tableau/i, /trier/i, /pagination/i,
    // Chinese
    /图表/i, /表格/i, /排序/i, /分页/i, /进度/i, /时间线/i,
    // Japanese
    /チャート/i, /グラフ/i, /テーブル/i, /ソート/i, /ページネーション/i,
    // Korean
    /차트/i, /그래프/i, /테이블/i, /정렬/i, /페이지네이션/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // UI COMPONENTS
  // ═══════════════════════════════════════════════════════════════════════════
  ui_components: [
    // Technical
    /gallery/i, /carousel/i, /slider/i, /swiper/i,
    /modal/i, /popup/i, /dialog/i, /drawer/i, /\bsheet\b/i,
    /toast/i, /snackbar/i, /tooltip/i, /popover/i,
    /\btabs?\b/i, /accordion/i, /collapse/i, /expand/i,
    /breadcrumb/i, /stepper/i, /sidebar/i, /navbar/i,
    /header/i, /footer/i, /\bcard\b/i, /avatar/i, /badge/i,
    /rating/i, /\bstar\b/i, /like/i, /heart/i,
    // Russian
    /галере/i, /слайдер/i, /карусел/i, /модал/i, /попап/i,
    /диалог/i, /тост/i, /подсказк/i, /вкладк/i, /аккордеон/i,
    /хлебн.*крошк/i, /пошагов/i, /боков.*панел/i, /навигаци/i, /меню/i,
    /шапк/i, /подвал/i, /карточк/i, /аватар/i, /бейдж/i, /рейтинг/i, /лайк/i,
    // Ukrainian
    /галере/i, /слайдер/i, /модальн/i, /діалог/i, /вкладк/i, /меню/i,
    /картк/i, /аватар/i, /рейтинг/i,
    // Spanish
    /galería/i, /carrusel/i, /modal/i, /diálogo/i, /pestañas/i,
    /navegación/i, /menú/i, /tarjeta/i,
    // German
    /galerie/i, /karussell/i, /modal/i, /dialog/i, /reiter/i,
    /navigation/i, /menü/i, /karte/i,
    // French
    /galerie/i, /carrousel/i, /modal/i, /dialogue/i, /onglets/i,
    /navigation/i, /menu/i, /carte/i,
    // Chinese
    /画廊/i, /轮播/i, /弹窗/i, /对话框/i, /标签页/i,
    /导航/i, /菜单/i, /卡片/i, /头像/i, /评分/i,
    // Japanese
    /ギャラリー/i, /カルーセル/i, /モーダル/i, /ダイアログ/i, /タブ/i,
    /ナビゲーション/i, /メニュー/i, /カード/i, /アバター/i,
    // Korean
    /갤러리/i, /캐러셀/i, /모달/i, /다이얼로그/i, /탭/i,
    /네비게이션/i, /메뉴/i, /카드/i, /아바타/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SEARCH & FILTER
  // ═══════════════════════════════════════════════════════════════════════════
  search_filter: [
    // Technical
    /filter/i, /\bsearch\b/i, /facet/i, /\btag\b/i, /category/i,
    /keyword/i, /query/i, /result/i, /highlight/i,
    // Russian
    /фильтр/i, /поиск/i, /фасет/i, /тег/i, /категори/i,
    /ключев.*слов/i, /результат/i, /подсветк/i,
    // Ukrainian
    /фільтр/i, /пошук/i, /тег/i, /категорі/i, /результат/i,
    // Spanish
    /filtro/i, /búsqueda/i, /etiqueta/i, /categoría/i, /resultado/i,
    // German
    /filter/i, /suche/i, /tag/i, /kategorie/i, /ergebnis/i,
    // French
    /filtre/i, /recherche/i, /étiquette/i, /catégorie/i, /résultat/i,
    // Chinese
    /筛选/i, /过滤/i, /搜索/i, /标签/i, /分类/i, /结果/i,
    // Japanese
    /フィルター/i, /検索/i, /タグ/i, /カテゴリー/i, /結果/i,
    // Korean
    /필터/i, /검색/i, /태그/i, /카테고리/i, /결과/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════════════════════════════════════
  content: [
    // Technical
    /markdown/i, /syntax.*highlight/i, /clipboard/i, /\bcopy\b/i,
    /share/i, /social/i, /comment/i, /reply/i, /thread/i,
    /\blike\b/i, /reaction/i, /\bfaq\b/i, /testimonial/i, /review/i,
    /pricing/i, /comparison/i, /feature\s*list/i, /hero/i, /cta\b/i,
    // Russian
    /копирован/i, /буфер/i, /поделить/i, /шаринг/i, /соц.*сет/i,
    /коммент/i, /ответ/i, /лайк/i, /реакци/i, /вопрос.*ответ/i,
    /отзыв/i, /прайс/i, /сравнен/i, /список.*функци/i,
    /подсветк.*код/i,
    // Ukrainian
    /копіюван/i, /поділити/i, /коментар/i, /відгук/i, /порівнян/i,
    // Spanish
    /copiar/i, /compartir/i, /comentario/i, /reseña/i, /comparación/i,
    // German
    /kopieren/i, /teilen/i, /kommentar/i, /bewertung/i, /vergleich/i,
    // French
    /copier/i, /partager/i, /commentaire/i, /avis/i, /comparaison/i,
    // Chinese
    /复制/i, /分享/i, /评论/i, /回复/i, /评价/i, /对比/i,
    // Japanese
    /コピー/i, /シェア/i, /コメント/i, /レビュー/i, /比較/i,
    // Korean
    /복사/i, /공유/i, /댓글/i, /리뷰/i, /비교/i,
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT & RESPONSIVE
  // ═══════════════════════════════════════════════════════════════════════════
  layout: [
    // Technical
    /responsive/i, /mobile/i, /tablet/i, /desktop/i,
    /breakpoint/i, /\bgrid\b/i, /flexbox/i, /\bflex\b/i, /layout/i,
    /column/i, /\brow\b/i, /spacing/i, /margin/i, /padding/i,
    /dark\s*mode/i, /light\s*mode/i, /theme/i,
    // Russian
    /адаптив/i, /респонсив/i, /мобильн/i, /планшет/i,
    /сетк/i, /колонк/i, /отступ/i, /тем[аы]/i, /темн.*режим/i, /светл.*режим/i,
    // Ukrainian
    /адаптивн/i, /мобільн/i, /планшет/i, /сітк/i, /тем/i,
    // Spanish
    /adaptable/i, /móvil/i, /tableta/i, /cuadrícula/i, /tema/i,
    // German
    /responsiv/i, /mobil/i, /tablet/i, /raster/i, /thema/i,
    // French
    /adaptatif/i, /mobile/i, /tablette/i, /grille/i, /thème/i,
    // Chinese
    /响应式/i, /自适应/i, /移动端/i, /平板/i, /主题/i, /暗色模式/i,
    // Japanese
    /レスポンシブ/i, /モバイル/i, /タブレット/i, /テーマ/i, /ダークモード/i,
    // Korean
    /반응형/i, /모바일/i, /태블릿/i, /테마/i, /다크모드/i,
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONTEXTUAL RELATIONSHIPS - Auto-boost when related terms appear together
// ═══════════════════════════════════════════════════════════════════════════════════════

const CONTEXT_BOOSTS: Array<{ triggers: RegExp[]; boost: ComplexityLevel; reason: string }> = [
  // User + data operations = likely needs auth/DB
  {
    triggers: [/user|пользовател|用户|ユーザー|사용자/i, /save|сохран|保存|저장/i],
    boost: 'high',
    reason: 'user-data-persistence',
  },
  // Multiple pages/sections = complex routing
  {
    triggers: [/page|страниц|页面|ページ|페이지/i, /\d{2,}|several|несколько|多个|いくつか|여러/i],
    boost: 'high',
    reason: 'multi-page-app',
  },
  // Profile + edit = user management
  {
    triggers: [/profile|профил|个人资料|プロフィール|프로필/i, /edit|редактир|编辑|編集|편집/i],
    boost: 'high',
    reason: 'user-profile-management',
  },
  // List + action buttons = CRUD interface
  {
    triggers: [/list|список|列表|リスト|목록/i, /delete|удал|删除|削除|삭제/i],
    boost: 'high',
    reason: 'crud-interface',
  },
  // Settings + save = persistent config
  {
    triggers: [/setting|настройк|设置|設定|설정/i, /save|apply|сохран|применить|保存|적용/i],
    boost: 'high',
    reason: 'persistent-settings',
  },
  // Sync across devices = data consistency
  {
    triggers: [/sync|synchron|синхрон/i, /device|устройств|девайс|设备|デバイス|장치/i],
    boost: 'medium',
    reason: 'cross-device-sync',
  },
  // Form + submit + server = backend needed
  {
    triggers: [/form|форм|表单|フォーム|양식/i, /submit|send|отправ|提交|送信|제출/i],
    boost: 'medium',
    reason: 'form-submission',
  },
  // Image + upload = file handling
  {
    triggers: [/image|photo|изображен|фото|图片|照片|画像|写真|이미지|사진/i, /upload|загруз|上传|アップロード|업로드/i],
    boost: 'high',
    reason: 'file-upload',
  },
  // Button + action verbs = interactive feature
  {
    triggers: [/button|кнопк|按钮|ボタン|버튼/i, /click|press|нажат|点击|クリック|클릭/i],
    boost: 'medium',
    reason: 'interactive-action',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════════════

const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  russian: /[а-яё]/i,
  ukrainian: /[їієґ]/i,
  japanese: /[\u3040-\u30ff]/,
  chinese: /[\u4e00-\u9fff]/,
  korean: /[\uac00-\ud7af\u1100-\u11ff]/,
  arabic: /[\u0600-\u06ff]/,
  hebrew: /[\u0590-\u05ff]/,
  thai: /[\u0e00-\u0e7f]/,
  greek: /[\u0370-\u03ff]/,
  cyrillic: /[\u0400-\u04ff]/,
};

function detectLanguage(text: string): string {
  // Check for specific scripts first
  if (LANGUAGE_PATTERNS.ukrainian.test(text)) return 'ukrainian';
  if (LANGUAGE_PATTERNS.russian.test(text) || LANGUAGE_PATTERNS.cyrillic.test(text)) return 'russian';
  if (LANGUAGE_PATTERNS.japanese.test(text)) return 'japanese';
  if (LANGUAGE_PATTERNS.chinese.test(text)) return 'chinese';
  if (LANGUAGE_PATTERNS.korean.test(text)) return 'korean';
  if (LANGUAGE_PATTERNS.arabic.test(text)) return 'arabic';
  if (LANGUAGE_PATTERNS.hebrew.test(text)) return 'hebrew';
  if (LANGUAGE_PATTERNS.thai.test(text)) return 'thai';
  if (LANGUAGE_PATTERNS.greek.test(text)) return 'greek';
  
  // Default to English for Latin scripts
  return 'english';
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TEXT NORMALIZATION & TYPO CORRECTION
// Handles: voice input garbage, typos, slang, mixed scripts
// ═══════════════════════════════════════════════════════════════════════════════════════

// Common typos and variations for HIGH triggers
const TYPO_CORRECTIONS: Record<string, string[]> = {
  // API & Integration typos
  'api': ['апи', 'эпи', 'апиай', 'aip', 'pai'],
  'database': ['датабейс', 'датабаза', 'датабэйс', 'databse', 'databaze', 'dtabase', 'datebase'],
  'auth': ['авс', 'аус', 'ауф', 'autj', 'auht', 'atuh'],
  'authentication': ['аутентификейшн', 'аутентификация', 'authentification', 'autentication', 'authntication'],
  'login': ['логин', 'лагин', 'логен', 'logn', 'lgin', 'loign'],
  'password': ['пассворд', 'пасворд', 'паролль', 'pasword', 'passowrd', 'passwrod'],
  'payment': ['пеймент', 'паймент', 'платёж', 'payemnt', 'paymnet', 'paymant'],
  'stripe': ['страйп', 'стрип', 'strpe', 'stirpe'],
  'checkout': ['чекаут', 'чекоут', 'chekout', 'checkou', 'chckout'],
  'cart': ['карт', 'корт', 'crat', 'catr'],
  'shop': ['шоп', 'щоп', 'shp', 'hsop'],
  'store': ['стор', 'стоор', 'stre', 'sotre'],
  'dashboard': ['дашборд', 'дэшборд', 'дашбоард', 'dashbord', 'dahsboard', 'dashbaord'],
  'admin': ['админ', 'адмін', 'admn', 'amin', 'adimn'],
  'analytics': ['аналитикс', 'аналитика', 'analyitcs', 'analitics', 'analytcs'],
  'notification': ['нотификейшн', 'уведомление', 'notificaton', 'notifcation', 'notificaiton'],
  'message': ['месседж', 'мессадж', 'сообщение', 'messge', 'mesage', 'massege'],
  'chat': ['чат', 'чят', 'caht', 'hcat'],
  'realtime': ['реалтайм', 'риалтайм', 'реал-тайм', 'realitme', 'realtiem', 'real time'],
  'websocket': ['вебсокет', 'вэбсокет', 'websocet', 'websoket', 'websokect'],
  'upload': ['аплоад', 'аплоуд', 'загрузить', 'uplod', 'uplaod', 'upoad'],
  'download': ['даунлоад', 'довнлоад', 'скачать', 'donwload', 'downlod', 'downlaod'],
  'form': ['форм', 'форма', 'frm', 'fomr', 'from'],
  'validation': ['валидейшн', 'валидация', 'validaton', 'validaiton', 'vaidation'],
  'button': ['баттон', 'кнопка', 'buttn', 'buton', 'botton'],
  'animation': ['анимейшн', 'анимация', 'animaton', 'animaiton', 'anmiation'],
  'component': ['компонент', 'компанент', 'componnt', 'componet', 'coponent'],
  'registration': ['регистрейшн', 'регистрация', 'реєстрація', 'registraton', 'registartion'],
  'subscription': ['сабскрипшн', 'подписка', 'subscripton', 'subscrption', 'subscribtion'],
  'transaction': ['транзакшн', 'транзакция', 'transacton', 'transction', 'transaciton'],
  'encryption': ['энкрипшн', 'шифрование', 'encrypion', 'encrypton', 'encyrption'],
  'integration': ['интегрейшн', 'интеграция', 'integraton', 'integartion', 'intergation'],
  'configuration': ['конфигурейшн', 'конфигурация', 'configuraton', 'configration', 'confguration'],
  'synchronization': ['синхронизейшн', 'синхронизация', 'synchronizaton', 'syncronization', 'synchonization'],
  'authorization': ['авторизейшн', 'авторизация', 'authorizaton', 'autherization', 'authroization'],
  'ecommerce': ['екомерс', 'икомерс', 'e-commerce', 'e commerce', 'ecomerce', 'ecommerece'],
  'catalog': ['каталог', 'каталок', 'catolg', 'catlog', 'cataog'],
  'inventory': ['инвентори', 'инвентарь', 'inventroy', 'inventry', 'inevntory'],
  'shipping': ['шиппинг', 'доставка', 'shiping', 'shpping', 'shippng'],
  'refund': ['рефанд', 'возврат', 'refnd', 'refudn', 'refuund'],
  'wallet': ['валлет', 'кошелек', 'walet', 'walllet', 'walelt'],
  'crypto': ['крипто', 'криптовалюта', 'crypo', 'cyrpto', 'cryptp'],
  'blockchain': ['блокчейн', 'блокчэйн', 'blockhain', 'blockchian', 'blokchain'],
  'token': ['токен', 'токін', 'tokn', 'toke', 'toekn'],
  'moderation': ['модерейшн', 'модерация', 'moderaton', 'moderaiton', 'modeation'],
  'statistics': ['статистикс', 'статистика', 'statistcs', 'statisitcs', 'statstics'],
  'report': ['репорт', 'отчёт', 'reprot', 'reoprt', 'reort'],
  'monitoring': ['мониторинг', 'моніторинг', 'monitring', 'monitorng', 'monitoing'],
};

const WORD_BOUNDARY_START = '(^|[^\\p{L}\\p{N}_])';
const WORD_BOUNDARY_END = '(?=[^\\p{L}\\p{N}_]|$)';

// Voice input common garbage patterns to clean
const VOICE_GARBAGE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Russian fillers
  { pattern: new RegExp(`${WORD_BOUNDARY_START}эээ+${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}ааа+${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}ммм+${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}нуу+${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}ну${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  // English fillers
  { pattern: new RegExp(`${WORD_BOUNDARY_START}uhh+${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}umm+${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}hmm+${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}like${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}basically${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  // Russian speech patterns
  { pattern: new RegExp(`${WORD_BOUNDARY_START}ну\\s+типа${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}короче${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}в\\s+общем${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}типа${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  // English speech patterns
  { pattern: new RegExp(`${WORD_BOUNDARY_START}you\\s+know${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  { pattern: new RegExp(`${WORD_BOUNDARY_START}i\\s+mean${WORD_BOUNDARY_END}`, 'giu'), replacement: '$1' },
  // Cleanup
  { pattern: /[.,!?;:]{2,}/g, replacement: ' ' },
  { pattern: /\s{2,}/g, replacement: ' ' },
];

// Slang → proper term mapping
const SLANG_MAP: Record<string, string> = {
  // Russian slang
  'магаз': 'магазин',
  'магазик': 'магазин',
  'шопчик': 'магазин',
  'юзер': 'пользователь',
  'юзеры': 'пользователи',
  'логинка': 'логин',
  'пасс': 'пароль',
  'пассворд': 'пароль',
  'бд': 'база данных',
  'дб': 'база данных',
  'апишк': 'api',
  'апишка': 'api',
  'апиха': 'api',
  'бэк': 'бэкенд',
  'фронт': 'фронтенд',
  'авторк': 'авторизация',
  'авторка': 'авторизация',
  'регистрашка': 'регистрация',
  'регистрация': 'регистрация',
  'корзинка': 'корзина',
  'чекаутик': 'checkout',
  'дашборда': 'дашборд',
  'админка': 'админ панель',
  'нотифки': 'уведомления',
  'нотификейшены': 'уведомления',
  'мессаги': 'сообщения',
  'чатик': 'чат',
  'стора': 'хранилище',
  'сторадж': 'хранилище',
  'аплоадить': 'загружать',
  'даунлоадить': 'скачивать',
  'кнопочка': 'кнопка',
  'формочка': 'форма',
  'валидашка': 'валидация',
  'анимашка': 'анимация',
  'компонент': 'компонент',
  'модалка': 'модальное окно',
  'попап': 'popup',
  'попапчик': 'popup',
  'тултип': 'tooltip',
  'дропдаун': 'dropdown',
  'инпут': 'input',
  'инпутик': 'input',
  'селект': 'select',
  'чекбокс': 'checkbox',
  'радио': 'radio',
  'свитчер': 'switch',
  'табы': 'tabs',
  'таблица': 'table',
  'листинг': 'список',
  'пагинация': 'pagination',
  'сортировка': 'sorting',
  'фильтрация': 'filter',
  'поиск': 'search',
  'сабмит': 'submit',
  'сабмитить': 'отправить',
  
  // English slang
  'db': 'database',
  'auth': 'authentication',
  'pwd': 'password',
  'usr': 'user',
  'btn': 'button',
  'msg': 'message',
  'notif': 'notification',
  'config': 'configuration',
  'sync': 'synchronization',
  'async': 'asynchronous',
  'repo': 'repository',
  'lib': 'library',
  'dep': 'dependency',
  'deps': 'dependencies',
  'func': 'function',
  'comp': 'component',
  'nav': 'navigation',
  'img': 'image',
  'vid': 'video',
  'bg': 'background',
  'txt': 'text',
  'num': 'number',
  'str': 'string',
  'arr': 'array',
  'obj': 'object',
  'err': 'error',
  'req': 'request',
  'res': 'response',
  'ctx': 'context',
  'ref': 'reference',
  'val': 'value',
  'var': 'variable',
  'prop': 'property',
  'props': 'properties',
  'attr': 'attribute',
  'elem': 'element',
  'idx': 'index',
  'len': 'length',
  'cnt': 'count',
  'qty': 'quantity',
  'amt': 'amount',
  'pmt': 'payment',
  'sub': 'subscription',
  'tx': 'transaction',
  'txn': 'transaction',
};

/**
 * Normalize and clean input text
 * - Remove voice garbage (эээ, ммм, like, you know)
 * - Expand slang to proper terms
 * - Fix common typos using fuzzy matching
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Remove voice input garbage
  for (const { pattern, replacement } of VOICE_GARBAGE_PATTERNS) {
    normalized = normalized.replace(pattern, replacement);
  }
  
  // Expand slang terms
  for (const [slang, proper] of Object.entries(SLANG_MAP)) {
    const isCyrillic = /[а-яё]/i.test(slang);
    const allowSuffix = isCyrillic && slang.length >= 4;
    const suffixPattern = allowSuffix ? '[а-яё]*' : '';
    const slangPattern = new RegExp(
      `${WORD_BOUNDARY_START}${escapeRegex(slang)}${suffixPattern}${WORD_BOUNDARY_END}`,
      'giu'
    );
    normalized = normalized.replace(slangPattern, `$1${proper}`);
  }
  
  // Clean up whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Fuzzy match with Levenshtein distance
 * Returns true if the word is within acceptable edit distance of the target
 */
function fuzzyMatch(word: string, target: string, maxDistance = 2): boolean {
  if (word === target) return true;
  if (Math.abs(word.length - target.length) > maxDistance) return false;
  
  // Simple Levenshtein
  const matrix: number[][] = [];
  for (let i = 0; i <= word.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= target.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= word.length; i++) {
    for (let j = 1; j <= target.length; j++) {
      const cost = word[i - 1] === target[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[word.length][target.length] <= maxDistance;
}

/**
 * Check if text contains a term (with typo tolerance)
 */
function containsTermFuzzy(text: string, term: string): boolean {
  // Direct match first
  if (text.includes(term)) return true;
  
  // Check known typo variants
  const variants = TYPO_CORRECTIONS[term];
  if (variants) {
    for (const variant of variants) {
      if (text.includes(variant)) return true;
    }
  }

  if (term.length <= 4) {
    return false;
  }
  
  // Fuzzy match each word in text
  const words = text.split(/\s+/);
  const maxDistance = term.length <= 6 ? 1 : 2;
  for (const word of words) {
    const cleaned = word.replace(/[^\p{L}\p{N}_-]/gu, '');
    if (cleaned.length < 3) continue;
    if (Math.abs(cleaned.length - term.length) > maxDistance) continue;
    if (fuzzyMatch(cleaned, term, maxDistance)) {
      return true;
    }
  }
  
  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════════════

export function analyzePromptComplexity(text: string): ComplexityLevel {
  const result = analyzePromptComplexityDetailed(text);
  return result.complexity;
}

export function analyzePromptComplexityDetailed(text: string): AnalysisResult {
  // STEP 1: Normalize text (clean garbage, expand slang, fix obvious issues)
  const normalizedText = normalizeText(text);
  const words = normalizedText.trim().split(/\s+/).length;
  const detectedLanguage = detectLanguage(text);
  
  const matchedHighCategories: string[] = [];
  const matchedMediumCategories: string[] = [];
  const contextBoosts: string[] = [];
  
  // STEP 2: Check HIGH patterns (regex + fuzzy matching)
  for (const [category, patterns] of Object.entries(HIGH_PATTERNS)) {
    let matched = false;
    
    // Standard regex matching
    for (const pattern of patterns) {
      if (pattern.test(normalizedText)) {
        matched = true;
        break;
      }
    }
    
    // Fuzzy matching for key terms if regex didn't match
    if (!matched) {
      const categoryKeyTerms = getCategoryKeyTerms(category);
      for (const term of categoryKeyTerms) {
        if (containsTermFuzzy(normalizedText, term)) {
          matched = true;
          break;
        }
      }
    }
    
    if (matched && !matchedHighCategories.includes(category)) {
      matchedHighCategories.push(category);
    }
  }
  
  // STEP 3: Check MEDIUM patterns
  for (const [category, patterns] of Object.entries(MEDIUM_PATTERNS)) {
    let matched = false;
    
    for (const pattern of patterns) {
      if (pattern.test(normalizedText)) {
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      const categoryKeyTerms = getMediumCategoryKeyTerms(category);
      for (const term of categoryKeyTerms) {
        if (containsTermFuzzy(normalizedText, term)) {
          matched = true;
          break;
        }
      }
    }
    
    if (matched && !matchedMediumCategories.includes(category)) {
      matchedMediumCategories.push(category);
    }
  }
  
  // STEP 4: Check contextual boosts
  for (const boost of CONTEXT_BOOSTS) {
    const allTriggersMatch = boost.triggers.every(trigger => trigger.test(normalizedText));
    if (allTriggersMatch) {
      contextBoosts.push(boost.reason);
      if (boost.boost === 'high' && !matchedHighCategories.includes(`context:${boost.reason}`)) {
        matchedHighCategories.push(`context:${boost.reason}`);
      } else if (boost.boost === 'medium' && !matchedMediumCategories.includes(`context:${boost.reason}`)) {
        matchedMediumCategories.push(`context:${boost.reason}`);
      }
    }
  }
  
  // Calculate confidence
  const totalHighMatches = matchedHighCategories.length;
  const totalMediumMatches = matchedMediumCategories.length;
  const confidence = Math.min(100, (totalHighMatches * 25) + (totalMediumMatches * 15) + (words > 20 ? 10 : 0));
  
  // Debug logging
  console.log('🧠 Complexity Analysis:', {
    original: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
    normalized: normalizedText.slice(0, 40) + (normalizedText.length > 40 ? '...' : ''),
    language: detectedLanguage,
    words,
    highCategories: matchedHighCategories,
    mediumCategories: matchedMediumCategories,
    contextBoosts,
    confidence,
  });
  
  // Determine complexity
  let complexity: ComplexityLevel = 'low';
  
  if (matchedHighCategories.length >= 1) {
    complexity = 'high';
  } else if (matchedMediumCategories.length >= 1 || words > 15) {
    complexity = 'medium';
  }
  
  return {
    complexity,
    matchedCategories: [...matchedHighCategories, ...matchedMediumCategories],
    contextBoosts,
    confidence,
    detectedLanguage,
  };
}

// Key terms for fuzzy matching per category
function getCategoryKeyTerms(category: string): string[] {
  const terms: Record<string, string[]> = {
    api_integrations: ['api', 'webhook', 'endpoint', 'integration', 'microservice', 'backend'],
    database: ['database', 'postgres', 'mysql', 'mongodb', 'supabase', 'firebase', 'migration'],
    authentication: ['auth', 'login', 'password', 'token', 'session', 'registration'],
    payments: ['payment', 'stripe', 'checkout', 'subscription', 'transaction', 'refund', 'wallet'],
    ecommerce: ['shop', 'store', 'cart', 'catalog', 'checkout', 'inventory', 'shipping'],
    admin_dashboards: ['admin', 'dashboard', 'analytics', 'report', 'statistics', 'monitoring'],
    realtime: ['realtime', 'websocket', 'chat', 'notification', 'message', 'streaming'],
    enterprise: ['crm', 'erp', 'saas', 'tenant', 'organization', 'workspace'],
    infrastructure: ['deploy', 'docker', 'kubernetes', 'serverless', 'monitoring', 'cron'],
    complex_features: ['calendar', 'booking', 'map', 'geolocation', 'pdf', 'export', 'import'],
  };
  return terms[category] || [];
}

function getMediumCategoryKeyTerms(category: string): string[] {
  const terms: Record<string, string[]> = {
    forms: ['form', 'input', 'validation', 'autocomplete', 'dropdown', 'select'],
    animations: ['animation', 'transition', 'parallax', 'fade', 'skeleton', 'shimmer'],
    data_visualization: ['chart', 'graph', 'table', 'pagination', 'sorting', 'timeline'],
    ui_components: ['modal', 'popup', 'tooltip', 'tabs', 'accordion', 'sidebar', 'navbar'],
    search_filter: ['search', 'filter', 'tag', 'category', 'facet'],
    content: ['markdown', 'comment', 'rating', 'testimonial', 'faq', 'pricing'],
  };
  return terms[category] || [];
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILITY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const SUPPORTED_LANGUAGES = [
  'english', 'russian', 'ukrainian', 'spanish', 'german', 'french',
  'portuguese', 'chinese', 'japanese', 'korean', 'arabic', 'turkish',
];

export const HIGH_CATEGORIES = Object.keys(HIGH_PATTERNS);
export const MEDIUM_CATEGORIES = Object.keys(MEDIUM_PATTERNS);

// Export for testing
export { normalizeText, fuzzyMatch, containsTermFuzzy, SLANG_MAP, TYPO_CORRECTIONS };
