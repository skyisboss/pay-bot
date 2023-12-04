logo = Ⓜ️
brand = 芒果钱包
bot = mgcashBot
channel = mgcashChannel
support = mgcashSupport
# 常用⚠️✅ ☑□ ▣□  ◉○
goHome = 🏠 首页
goBack = ↩️ 返回
goback = ↩️ 返回
confirm = ▶️ 确认
cancel = ⏹️ 取消
noData = 🤷‍♂️ 暂无数据
close = ❌ 关闭
add = ➕ 添加
remove = ⛔ 移除
delete = ⛔ 删除
manage = ⚙️ 管理
reset = 🔄 重置
loading = ⌛ 正在处理,请稍后...
nodata = <b>🚥 暂无数据记录</b>
pageInfo = 当前第 {$currPage} 页, 共 {$totalPage} 页
firstPage = · 首页
endPage = 尾页 ·
prvePage = « 上页
nextPage = 下页 »
statusSuccess = 成功
statusFail = 失败
serverStop = 服务异常，请稍后再试
httpError = 网络加载异常
sessionTimeOut = 
    会话已过期
    点击重新打开钱包 /start
invalidInput = 无效的输入消息
## ============================
wallet = 💰 我的钱包
payment = 🎛️ 商户集成
secured = 🛡️ 担保交易
store = 🏪 自动售卖
vending = 🏪 自动售卖
invite = 🎁 邀好友 赚佣金
setting = ⚙️ 设置
homeWelcome =
    <b>{logo} {brand}</b> — 基于Telegram的安全加密货币钱包。
    转账收款 实时到账 无手续费
    关注官方频道 @{channel} 获取更多资讯

## ============================
# wallet 钱包
walletHomeMsg = 
    <b>{wallet}</b> 
    ID: <code>{$uid}</code>

    <b>TRC20 · USDT =</b> <code>{$trc20Balance}</code>

    <b>BEP20 · USDT =</b> <code>{$bep20Balance}</code>

    <b>ERC20 · USDT =</b> <code>{$erc20Balance}</code>

    <b>{$fait_code} ≈ </b> <code>{$fait_symbol}{$fait_balance}</code>

transfer = 💸 转账
hongbao = 🧧 发红包
withdraw = 🏧 提币
deposit = 💳 充值
history = 📑 查看记录
exchangeRate = 📈 实时汇率
showRate = 
    {exchangeRate} ({$updated})

    1 USD ≈   {$usd_cny} CNY 
    1 USD ≈ {$usd_php} PHP 
    ------------------------
    1 USD ≈ {$usd_trc20} TRC20·USDT 
    1 USD ≈ {$usd_erc20} ERC20·USDT 
    1 USD ≈ {$usd_bep20} BEP20·USDT 
## ============================
# 钱包充值
showQrCode = 显示二维码
hideQrCode = 隐藏二维码
depositCurrency = 
    <b>{deposit}</b>

    · TRC20 波场网络
    · BEP20 币安网络
    · ERC20 以太坊网络

    <b>👇 选择一种您将充值的货币</b>

depositAddress = 
    <b>{deposit} {$symbol}</b>
    请将资金发送到以下地址

    <code>{$address}</code>
    (点击地址可复制)

    ⚠️ 该地址仅支持 <b>{$symbol}</b> 充值, 最小充值: {$minAmount}
    ⏱️ 充值后预计{$received}分钟到账
    {$qrcode}
## ============================
# 钱包转账
invalidPayee = 收款人不存在
invalidAmount = 金额错误
transferCreate = 创建转账
transferBalanceFail = ⚠️ <b>{$symbol}</b> 余额不足
transferInfo = 
    { NUMBER($step) ->
        *[1] 币种: {$chain}

        [2] 币种: {$chain}
            金额: {$amount}

        [3] 币种: {$chain}
            金额: {$amount}
            收款人: {$payee}
            {$payee_name}

        [4] 币种: {$chain}
            金额: {$amount}
            收款人: {$payee}
            {$payee_name}
    }
transferActionMsg = 
    <b>{wallet}</b> » {transfer}

    { NUMBER($step) ->
        *[0]
        
        · 转账实时到账,无需手续费.
        
        <b>👇 请选择转账的币种:</b>
        [1] 
        {transferInfo}

        <b>👉 请回复转账金额</b>
        [2] 
        {transferInfo}

        <b>👉 请回复收款人ID</b>
        ⚠️ "我的钱包"页面可查看ID
        [3] 
        {transferInfo}

        <b>⚠️ 请确认是否转账操作?</b>

        [4] 
        {transferInfo}

        <b>✅ 转账操作成功</b>
    }

## ============================
# 钱包提现
invalidAddress = 地址错误
withdrawBalanceFail = 余额不足
withdrawInfo = 
    { NUMBER($step) ->
        *[1]
        当前币种: {$chain}
        [2]
        当前币种: {$chain}
        钱包余额: {$balance}
        提币地址: {$address}
        [3]
        当前币种: {$chain}
        钱包余额: {$balance}
        提币地址: {$address}
    }
    
withdrawActionMsg = 
    <b>{wallet}</b> » {withdraw}

    { NUMBER($step) ->
        *[0]
        
        · 将钱包余额提取到外部地址
        
        <b>👇 请选择提币的币种:</b>
        [1] 
        {withdrawInfo}

        <b>请输入 {$chain} 提币地址</b>
        ⚠️ 注意: 错误的地址将可能导致资产丢失
        [2] 
        <b>👇 检查一下信息是否正确</b>
        {withdrawInfo}

        <b>⚠️ 请确认是否提币?</b>
        [3] 
        {withdrawInfo}

        ✅ <b>提币操作成功</b>
    }
## ============================
# 历史记录
depositHistory = 充值记录
transferHistory = 转账记录
withdrawHistory = 提币记录
hongbaoHistory = 红包记录
detailHistory = 详情记录
historyMsg = 
    <b>{history}</b>

    · 查看相关历史记录信息

    <b>👇 请选择操作项:</b>
historyListMsg = 
    <b>{history}</b> » { NUMBER($item) ->
        *[0] {depositHistory}
        [1] {transferHistory}
        [2] {withdrawHistory}
        [3] {hongbaoHistory}
    }

    · 今日: {$count1}
    · 昨日: {$count2}
    · 总计: {$count3}

    · {$pageInfo}
depositHistoryDetail = 
    {depositHistory} {$time}
    ------------------------

    币种: {$chain}
    ------------------------
    金额: {$amount}
    ------------------------
    状态: {$status}
## ============================
# 红包
hongbao1 = 🧧 普通红包 
hongbao2 = 🧧 专属红包 
hongbao3 = 🧧 拼手气红包 
hongbaoOtherAmount = ✏️ 输入金额
hongbaoBalanceFail = 余额不足
hongbaoInputFail = 无效输入
hongbaoUserFail = 用户不存在
hongbaoBase = 
    { NUMBER($step) ->
        *[1]
        · 类型: {$name}
        [2]
        · 类型: {$name}
        · 币种: {$chain}

        [3]
        · 类型: {$name}
        · 币种: {$chain}
        · 金额: {$amount}
        { NUMBER($type) ->
            *[0]DELETE_EMPTY_STRING
            [1]· 专属: {$user}
            [2]· 拼手气: {$split}
        }

        [4]
        · 类型: {$name}
        · 币种: {$chain}
        · 金额: {$amount}
        { NUMBER($type) ->
            *[0]DELETE_EMPTY_STRING
            [1]· 专属: {$user}
            [2]· 拼手气: {$split}
        }

        [20]
        · 类型: {$name}
        · 币种: {$chain}
        [21]
        · 类型: {$name}
        · 币种: {$chain}
        · 金额: {$amount}
        [22]
        · 类型: {$name}
        · 币种: {$chain}
        · 金额: {$amount}
    }
hongbaoActionMsg = 
    <b>{wallet}</b> » {hongbao}

    { NUMBER($step) ->
        *[0]
        · 普通红包，任何人可领取
        · 专属红包，指定专属领取人
        · 拼手气红包，随机金额先到先得

        <b>👉 请选择发送红包的类型</b>
        [1]
        {hongbaoBase}

        <b>👇 请选择红包币种</b>
        [2]
        {hongbaoBase}

        <b>👇 请选择红包金额</b>
        可用余额: {$balance}
        [3]
        {hongbaoBase}

        <b>👉 请确认是否创建红包?</b>
        [4]
        {hongbaoBase}

        ✅ <b>红包创建成功</b>

        [20]
        {hongbaoBase}

        <b>👉 请输入红包金额</b>
        可用余额: {$balance}
        [21]
        {hongbaoBase}

        <b>👉 请回复红包专属用户ID</b>
        [22]
        {hongbaoBase}

        <b>👉 请回复拼手气红包拆分数量</b>
    }

hongbaoMsg = 
    <b>{hongbao}</b>

    · 普通红包，任何人可领取
    · 专属红包，指定领取人
    · 拼手气红包，随机金额先到先得 

    <b>👉 请选择发送红包的类型</b>
hongbaoSelectChain = 
    <b>{$type}</b>

    <b>👉 请选择红包币种</b>

hongbaoSelectAmount = 
    <b>{$type}</b>

    · 币种: {$chain}

    <b>👉 请选择红包金额</b>

hongbaoInputAmount = 
    <b>{$type}</b>

    · 币种: {$chain}

    <b>👉 请回复发送红包金额</b>

hongbaoReview = 
    <b>{hongbao}</b>

    · 币种: {$chain}
    · 金额: {$amount}
    · 类型: {$type}

    <b>👉 请确认是否创建红包?</b>

hongbaoSendSuccess = 
    <b>{hongbao}</b>

    · 币种: {$chain}
    · 金额: {$amount}
    · 类型: {$type}

    ✅ <b>创建成功</b>


## ============================
# 设置 ￥/CNY
settingBackup = ⛑️ 备用账户
settingPinCode = 🔐 安全密码
settingLang = 🏁 语言设置
settingCurrency = 💱 本地货币
settingMsg = 
    <b>{setting}</b>

    <b>ID:</b> <code>{$uid}</code>
    <b>VIP:</b> {$vip}
    <b>语言:</b> {$lang}
    <b>法币:</b> {$currency}

## ============================
# 备用账户
backupAdd = ➕ 添加备用账户
backupEdit = ✏️ 更改备用账户
backupCopyAssets = 转移资产
backupMsg = 
    <b>{settingBackup}</b>

    { NUMBER($status) ->
        *[0] · 若当前账户无法登录时，备用账户可用于转移资产
        [1] · 备用账户: {$account}
    }

    { NUMBER($status) ->
        *[0] <b>⚠️ 还未关联备用账户</b>
        [1] <b>✅ 已经关联备用账户</b>
    }

backupAddMsg = 
    <b>{settingBackup}</b> » { NUMBER($action) ->
        *[0] {backupAdd}
        [1] {backupEdit}
    }

    { NUMBER($step) ->
        *[0]
        <b>👉 请发送待关联账户的用户名</b>
        例如: <code>@{bot}</code>

        [1]
        · 已关联: {$account}

        ✅ <b>关联成功</b>
    }


## ============================
# 安全密码
pinpwdSetAlert = 请先设置安全密码
pinpCodeAdd = 🔐 设置密码
pinpCodeEdit = ✏️ 更改密码
pincodeOldFail = 旧密码不正确
pincodeFail = 安全密码修改失败
settingPinCodeMsg = 
    <b>{setting}</b> » {settingPinCode}

    · 设置安全密码可有效的保护资产安全

    { NUMBER($status) ->
        *[0] <b>⚠️ 您还未设置安全密码</b>
        [1] <b>✅ 您已经设置安全密码</b>
    }
pincodeInputMsg = 
    <b>{setting}</b> » {settingPinCode}

    { NUMBER($status) ->
        *[0] · 请输入新密码 (6位数字)
        [1] · 请输入旧密码 (6位数字)
    }

    { NUMBER($length) ->
        *[0] <code>******</code>
        [1] <code>{$text}*****</code>
        [2] <code>{$text}****</code>
        [3] <code>{$text}***</code>
        [4] <code>{$text}**</code>
        [5] <code>{$text}*</code>
        [6] <code>{$text}</code>
    }

pincodeConfirm = 
    <b>{setting}</b> » {settingPinCode}

    · <code>{$text}</code>

    { NUMBER($step) ->
        *[0] 
        <b>👉 请确认是否使用此密码</b>
        [1] 
        <b>✅ 密码设置成功</b>
    }  

## ============================
# 多语言设置
settinglangMsg = 
    <b>{settingLang}</b>

    · 当前显示语言: {$lang}

    <b>⚠️ 请选择显示语言 👇</b>  
## ============================
# 本地货币
settingCurrencytMsg = 
    <b>{settingCurrency}</b>

    · 当前显示货币: {$currency}

    <b>👇 请选择显示货币</b>  

## ============================
# 邀请好友
sendToFriend = 发送给朋友
inviteLog = 🔖 邀请记录
inviteWithdraw = 🎁 提取佣金
inviteWithdrawSuccess = 提取成功，佣金将转入钱包余额
inviteWithdrawFail = 提取失败，没有足够的余额
inviteTime1 = 今日
inviteTime2 = 昨日
inviteTime3 = 月度
inviteTime4 = 全部
inviteMsg = 
    <b>{invite}</b> · <a href="https://google.com/">了解更多 ›</a>

    · Telegram用户点击邀请链接即可完成注册
    · 完成注册新用户将自动成为您的下级代理
    · 您将获得下级代理产生手续费的 <b>50%</b> 作为奖励
    · <a href="https://google.com/">了解更多 ›</a>

    <b>👇 邀请链接(点击可复制)</b>
    <code>{$link}</code>

inviteDetail = 
    <b>{invite}</b> · <a href="https://google.com/">了解更多 ›</a>

    <b>· 我的邀请: </b>
       今日邀请: {$count1}
       昨日邀请: {$count2}
       月度邀请: {$count3}
       全部邀请: {$count4}

    <b>· 我的佣金: </b>
       TRC20 · USDT: {$trc20}
       BEP20 · USDT: {$bep20}
       ERC20 · USDT: {$erc20}

## ============================
# 商户集成
paymentNew = 开通支付应用
paymentManage = 管理支付应用
paymentDocument = 使用文档
paymentCreateSuccess = 
    <b>{payment}</b> » {paymentNew}
    
    · 创建集成支付

    ✅ 创建成功
paymentMsg = 
    <b>{payment}</b> · <a href="https://google.com/">了解更多 ›</a>

    · 为商家提供安全、快速、匿名的在线支付系统
    · 各种机器人系统和网站插件、现有系统轻松整合
    · 集成到你的服务中，使用数字货币支付秒到账
    · <a href="https://google.com/">查看Web插件、机器人</a>

    余额转出费用3%，其他任何操作 0 费用

paymentAppMsg = 
    <b>{payment}</b> » {paymentManage}

    <b>· 今日收款: </b>{$count1}
    <b>· 昨日收款: </b>{$count2}
    <b>· 全部收款: </b>{$count3}

    <b>· 当前余额: </b>
       TRC20 · USDT: {$trc20}
       BEP20 · USDT: {$bep20}
       ERC20 · USDT: {$erc20}

    👇 收款链接(点击可复制)
    <code>{$link}</code>

paymentAppToken = 支付密钥
paymentAppTokenReset = 🔄 更换密钥
paymentAppTokenResetOK = 更换密钥成功
paymentAppHook = 回调通知
paymentAppHookAdd = 设置回调地址
paymentAppHookEdit = 修改回调地址
paymentAppWithdraw = 提取余额
paymentAppDetail = 详细记录
paymentDetailIn = 收入记录
paymentDetailOut = 提取记录
paymentAppWithdrawSuccess = 提取成功，余额将转入钱包
paymentAppWithdrawFail = 提取失败，余额不足
paymentTokenMsg = 
    <b>{payment}</b> » {paymentAppToken}

    (👇 点击可复制密钥)
    <code>{$token}</code>

    <b>⚠️ 密钥用于操作支付权限, 请妥善保管</b>
paymentHookMsg = 
    <b>{payment}</b> » {paymentAppHook}

    { NUMBER($step) ->
        *[0]
        · 设置您的支付回调通知网址
        · 新付款时发送相关通知到该网址
        
        { NUMBER($hookStatus) ->
            *[0]<b>⚠️ 通知地址:</b> 未设置
            [1]<b>✅ 通知地址:</b> <code>{$hook}</code>
        }
        [1]
        <b>👉 请发送回调通知网址</b>
        例如: <code>https://telegram.org</code>
    }
paymentDetailMsg = 
    <b>{payment}</b> » {paymentAppDetail}

    { NUMBER($category) ->
        *[0] <b>👇 请选择查看项目</b>
        [1] · <b>{paymentDetailIn}</b>
        [2] · <b>{paymentDetailOut}</b>
    }

paymentDetailMoreMsg = 
    { NUMBER($category) ->
        *[1] {paymentDetailIn} {$time}
        [2] {paymentDetailOut} {$time}
    }

    {$chain}
    ------------------------
    金额: {$amount}
    ------------------------
    状态: {$status}

## ============================
# vending 自动售卖
vendingPublish = 发布商品
vendingEdit = 编辑商品
vendingDelete = 删除商品
vendingManage = 管理商品
vendingSetting = 店铺设置
vendingSettingName = 店铺名称
vendingSettingStatus= 店铺状态
vendingSettingSuccess = ✅ 操作成功 
vendingHomeMsg = 
    <b>{vending}</b> { NUMBER($status) ->
        *[0] [{vendingStatusClose}]
        [1] [{vendingStatusOpen}]
    }

    <b>· 商品数量: </b> <code>{$count1}</code>
    <b>· 成交数量: </b> <code>{$count2}</code>
    <b>· 成交金额: </b>
       <code>TRC20 · USDT: {$trc20}</code>
       <code>BEP20 · USDT: {$bep20}</code>
       <code>ERC20 · USDT: {$erc20}</code>

    👇 店铺链接(点击可复制)
    <code>{$link}</code>

vendingManageMsg = 
    <b>{vending}</b> » {vendingManage}

    { NUMBER($index) ->
        *[0] · (店铺名称未设置)
        [1] · {$name}
    }
# 🟢 正常 🔴 关闭
vendingStatusOpen = 🟢 营业中
vendingStatusClose = 🔴 休息中
vendingSettingMsg =
    <b>{vending}</b> » {vendingSetting}

    { NUMBER($step) ->
        *[0]
        · 店铺名称: (未设置)
        · 店铺状态: {vendingStatusOpen}

        <b>👇 请选择设置项</b> 
        [1]
        · 设置名称

        <b>👉 请回复店铺名称</b> 
    }

vendingTextTitle = 标题
vendingTextPrice = 价格
vendingTextDesc = 描述
vendingTextKami = 内容
vendingPriceFail = 价格错误
vendingGoodsMsg =
    <b>{vending}</b> » { NUMBER($action) ->
        *[0] {vendingPublish}
        [1] {vendingEdit}
    }

    { NUMBER($step) ->
        *[0]
        <code>{vendingTextTitle}=[填写商品标题]
        {vendingTextPrice}=[填写商品价格]
        {vendingTextDesc}=[填写商品描述]
        {vendingTextKami}=[付款后显示内容]</code>

        <b>👆 复制以上格式，编辑正确信息后发送回复</b>
        · 将文本“[...]”里文本替换为正确内容

        [1]
        <code>{vendingTextTitle}=[{$title}]
        {vendingTextPrice}=[{$price}]
        {vendingTextDesc}=[{$desc}]
        {vendingTextKami}=[{$kami}]</code>

        <b>👆 复制以上格式，编辑正确信息后发送回复</b>
        · 将文本“[...]”里文本替换为正确内容

        [2]
        ({vendingTextTitle}:) <b>{$title}</b>

        ({vendingTextPrice}:) <b>{$price}</b>

        ({vendingTextDesc}:) <b>{$desc}</b>

        ({vendingTextKami}:) <b>{$kami}</b>

        { NUMBER($action) ->
            *[0] <b>👉 确定要发布商品吗？</b>
            [1] <b>👉 确定要编辑商品吗？</b>
        }
    }
vendingGoodsDetailMsg = 
    <b>{vending}</b> » {vendingManage}

    · <b>已售: </b>{$sales}
    · <b>浏览: </b>{$views}

    <b>{vendingTextTitle}:</b> {$title}
    <b>{vendingTextPrice}:</b> {$price}
    <b>{vendingTextDesc}:</b> {$desc}
    <b>{vendingTextKami}:</b> {$kami}

    发布时间: {$time}

vendingGoodsDeleteMsg = 
    <b>{vending}</b> » {vendingManage}

    · {$title}

    { NUMBER($step) ->
        *[0] <b>👉 确定删除此商品吗？</b>
        [1] <b>✅ 删除成功</b>
    }
    
## ============================
# secured = 🛡️ 担保交易
securedAdd = 创建交易
securedManage = 管理交易
securedManageEdit = 编辑交易
securedManageDele = 删除交易
securedManageExit = 退出交易
securedManageContent = 设置交易内容
securedMine = 我创建的
securedJoin = 我参与的
securedAgreement = 使用条款
securedAgreementAlert = 我已了解交易风险
securedStatusProgress = 🟢 进行中
securedStatusPending = 🟡 待处理
securedAddSuccess = 创建成功
securedManageNotify = 提醒对方
securedManageDelivery = 交付服务
securedManageReceive = 接收服务
securedManagePayment = 放行款项
securedManageClose =  关闭交易
securedManageCloseSuccess = ✅ 关闭交易成功 
securedManageCompleteContent = <b>⚠️ 待完善交易内容</b>
securedManageJoin = 加入担保交易
securedManageCloseMsg = 
    <b>{secured}</b> · {securedManage}

    · 关闭未成立的担保，资金原路退回
    
    <b>👉 确认关闭本次担保交易吗？</b>

securedManageActionMsg = 
    <b>{secured}</b> · {securedManage}

    { NUMBER($action) ->
        *[1]
        · 加入交易即担保，即表示您知晓交易规则和风险

        <b>👉 确认加入担保交易吗？</b>
        [2]
        · 交付服务，已向对方交付具体服务

        <b>👉 确认交付服务吗？</b>
        [3]
        · 接收服务，已收到对方交付的服务
    
        <b>👉 确认接收服务吗？</b>
        [4]
        · 放行款项，系统将款项划转对方账号
    
        <b>👉 确认放行款项吗？</b>
    }
securedManageNotifyMsg = 
    { NUMBER($action) ->
        *[2] 已发送提醒对方交付服务
        [3] 已发送提醒对方接收服务
        [4] 已发送提醒对方放行款项
    }

securedMsg = 
    <b>{secured}</b> · <a href="https://google.com/">了解更多 ›</a>

    · 基于双向担保只能管理资金和流程
    · 可靠的模型解决交易的信任基础
    · 无需人工介入，无需任何费用

securedAgreementMsg = 
    · 担保交易使用智能合约全程管理资金和流程运转

    <b>{securedAgreement}</b>
    · 担保双方应提前制定各项交易准则、服务交付和接收标准等规则
    · 乙方加入时交易开始成立，无法中断，资金款项冻结直至交易完成
    · 状态流程未正常执行时双方可自行协商，否则流程持续停留当前状态
    · 鼓励诚信交易，若申请人工介入处理纠纷，将收双方保证金5%作为费用
    · 经由官方频道公布后邀请3人成立裁判组，依据担保内容所示投票判定

    <b>状态流程</b>
     1 · 甲方创建
     2 · 乙方加入
     3 · 交付服务
           甲方交付/乙方接收
     4 · 放行款项
           乙方放款/甲方接款
     5 · 交易完成

    <b>⚠️ 点击“确认”即表示您同意《{securedAgreement}》</b>

securedManageMsg = 
    <b>{secured}</b> · {securedManage}

    { NUMBER($category) ->
        *[0] <b>👇 请选择查看项目</b>  
        [1] <b>· {securedMine}: {$totalCount}</b> 
        [2] <b>· {securedJoin}: {$totalCount}</b> 
    }
securedManageContentMsg = 
    <b>{secured}</b> · {securedManage}

    { NUMBER($step) ->
        *[0]
        · 描述本次担保的交易内容，可作为纠纷判定依据

        <b>👇 请输入担保的交易内容</b>  
        [1]
        ·{$content}

         <b>✅ 设置成功</b> 
    }

securedAddMsg = 
    <b>{secured}</b> » {securedAdd}

    { NUMBER($step) ->
        *[0] · 创建担保交易，{securedAgreementAlert}

            <b>👇 请选择担保交易的币种</b> 
        [1] · 担保币种: {$symbol}

            <b>👉 请输入担保交易金额</b> 
        [2] · 担保币种: {$symbol}
            · 担保金额: {$amount}

            <b>👇 请设置交易保证金比例</b> 
        [3] · 担保币种: {$symbol}
            · 担保金额: {$amount}
            · 保证金: {$deposit}

            <b>👉 请确认是否创建担保交易</b> 
    }

# · 交易币种: 
# · 我方保证金: 
# · 对方保证金: 
securedManageDetail =
    <b>{secured}</b> » {securedManage}

    编号: <code>#{$id}</code>
    担保币种: {$chain}
    担保金额: {$amount}
    保证金({$percent}): {$deposit}
    
    甲方: {$owner}
    乙方: {$partner}
    内容: {$content}

    状态流程:
      {securedDetailStep1}
      {securedDetailStep2}
      {securedDetailStep3}
      {securedDetailStep4}
      {securedDetailStep5}

    👇 担保链接(点击可复制)
    <code>{$link}</code>

securedDetailStep1Text = 创建交易
securedDetailStep2Text = 担保成立
securedDetailStep3Text = 交付服务
securedDetailStep3Text2 = 接收服务
securedDetailStep4Text = 放行款项
securedDetailStep4Text2 = 接收款项
securedDetailStep5Text = 交易完成
securedDetailStep1 = 
    1 { NUMBER($step) ->
        *[0] · {securedDetailStep1Text}
        [1] » <b>{securedDetailStep1Text}</b> «
    }
securedDetailStep2 = 
    2 { NUMBER($step) ->
        *[0] · {securedDetailStep2Text}
        [2] » <b>{securedDetailStep3Text}</b> «
    }
securedDetailStep3 = 
    3 { NUMBER($step) ->
        *[0] · {securedDetailStep3Text}
        [3] » <b>{securedDetailStep3Text}</b> «
    }
securedDetailStep4 = 
    4 { NUMBER($step) ->
        *[0] · {securedDetailStep4Text}
        [4] » <b>{securedDetailStep4Text}</b> «
    }
securedDetailStep5 = 
    { NUMBER($step) ->
        *[0] 5 · {securedDetailStep5Text}
        [5] 5 » <b>{securedDetailStep5Text}</b> 
    }