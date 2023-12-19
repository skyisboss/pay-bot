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
firstPage =「 首页
endPage = 尾页 」
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

    <b>TRC20 · USDT =</b> <code>{$trc20}</code>

    <b>BEP20 · USDT =</b> <code>{$bep20}</code>

    <b>ERC20 · USDT =</b> <code>{$erc20}</code>

    <b>{$fait_currency} ≈ </b> <code>{$fait_symbol}{$fait_balance}</code>

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
    <b>{deposit} {$token}</b>
    请将资金发送到以下地址

    <code>{$address}</code>
    (点击地址可复制)
    { NUMBER($show) ->
        *[0] {""}
        [1] {""}<a href="{$qrcode}">  </a>
    }
    ⚠️ 该地址仅支持 <b>{$token}</b> 充值, 最小充值: {$min_amount}
    
    
# ⏱️ 充值后预计{$received}分钟到账
## ============================
# 钱包转账
invalidPayee = 收款人不存在
invalidAmount = 金额错误
transferCreate = 创建转账
transferBalanceFail = ⚠️ <b>{$symbol}</b> 余额不足
transferInfo = 
    { NUMBER($step) ->
        *[1] 币种: {$token}

        [2] 币种: {$token}
            金额: {$amount}

        [3] 币种: {$token}
            金额: {$amount}
            收款人: {$touser}

        [4] 币种: {$token}
            金额: {$amount}
            收款人: {$touser}
    }
transferActionMsg = 
    <b>{wallet}</b> » {transfer}

    { NUMBER($step) ->
        *[0]
        
        · 即时到账 无手续费
        
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
        币种: {$chain}
        [2]
        地址: {$address}
        币种: {$chain}
        <b>*可用余额: {$balance}</b>
        <b>*实际到账: {$balance}</b>
        <b>*手续费: 10</b>
        [3]
        地址: {$address}
        币种: {$chain}
        <b>*可用余额: {$balance}</b>
        <b>*实际到账: {$balance}</b>
        <b>*手续费: 10</b>
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

        {withdrawInfo}

        <b>⚠️ 检查信息是否正确并确认是否提币?</b>
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

    · {$pageInfo}

depositHistoryDetail = 
    { NUMBER($item) ->
        *[0] {depositHistory}
        [1] {transferHistory}
        [2] {withdrawHistory}
    } ({$time})

    币种: {$token}
    ------------------------
    金额: {$amount}
    ------------------------
    状态: {$status}
hongbaoHistoryDetail = 
    {$name} 

    {$time}
    ------------------------
    金额: {$amount} U · {$token}
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
hongbaoUserSelfFail = 不能发送给自己
hongbaoClaim = 🧧 立即领取
hongbaoClaimStatus0 = 已领取
hongbaoClaimStatus1 = 未领取
hongbaoClaimMsg = 
    { NUMBER($step) ->
        *[0] 
        <b>{$name}</b>
        {""}
        [1] 
        <b>✅ 领取成功</b>
        {""}
        <b>· 类型: {$name}</b>
    }
    <b>· 币种: {$token}</b>
    <b>· 金额: {$amount}</b>
    { NUMBER($type) ->
        *[0] {""}
        [1]
        <b>· 专属: {$user}</b>
        {""}
    }
    ⚠️ 领取后资金自动存入钱包余额

hongbaoInfo = 
    { NUMBER($step) ->
        *[1]
        · 类型: {$name}
        [2]
        · 类型: {$name}
        · 币种: {$chain}
        [3]
        · 类型: {$name}
        · 币种: {$chain}
        [4]
        · 类型: {$name}
        · 币种: {$chain}
        · 金额: {$amount}
        [5]
        · 类型: {$name}
        · 币种: {$chain}
        · 金额: {$amount}
        [6]
        · 类型: {$name}
        · 币种: {$chain}
        · 金额: {$amount}
        [7]
        · 类型: {$name}
        · 币种: {$chain}
        · 金额: {$amount}
    }

hongbaoMsg = 
    <b>{wallet}</b> » {hongbao}

    { NUMBER($step) ->
        *[0]
        · 普通红包，任何人可领取
        · 专属红包，指定领取人
        · 拼手气红包，随机金额先到先得 

        <b>👉 请选择发送红包的类型</b>
        [1]
        {hongbaoInfo}

        <b>👇 请选择红包币种</b>
        [2]
        {hongbaoInfo}

        <b>👇 请选择红包金额</b>
        我的余额: {$balance}
        [3]
        {hongbaoInfo}

        <b>👉 请输入红包金额</b>
        我的余额: {$balance}
        [4]
        {hongbaoInfo}

        <b>👉 请回复专属红包用户ID</b>
        [5]
        {hongbaoInfo}

        <b>👉 请回复拼手气红包总量</b>
        [6]
        { NUMBER($type) ->
            *[0] 
            {hongbaoInfo}
            [1]
            {hongbaoInfo}
            · 专属: {$user}
            [2]
            {hongbaoInfo}
            · 总数: {$split}
        }

        <b>👉 请确认是否创建红包?</b>
        [7]
        { NUMBER($type) ->
            *[0] 
            {hongbaoInfo}
            [1]
            {hongbaoInfo}
            · 专属: {$user}
            [2]
            {hongbaoInfo}
            · 总数: {$split}
        }
        · 链接: {$link}

        ✅ <b>红包创建成功</b>
    }


## ============================
# 设置 ￥/CNY
settingBackup = ⛑️ 备用账户
settingPinCode = 🔐 安全密码
settingLang = 🏁 语言设置
settingCurrency = 💱 本地货币
settingMsg = 
    <b>{setting}</b>

    <b>ID:</b> <code>{$uid}</code>
    <b>VIP:</b> {$rank}
    <b>语言:</b> {$language}
    <b>货币:</b> {$currency}

## ============================
# 备用账户
backupAdd = ➕ 添加备份账户
backupEdit = 更改备份账户
backupEditFail = 备份账户不能添加自己
backupRemove = ⛔ 移除备份账户
backupCopyAssets = 转移资产

backupMsg = 
    <b>{settingBackup}</b>

    { NUMBER($status) ->
        *[0] · 若当前账户无法登录时，备份账户可用于转移资产
        [1] · 备份账户: {$account}
        [2] · 备份账户: {$account}
    }

    { NUMBER($status) ->
        *[0] <b>⚠️ 还未关联备份账户</b>
        [1] <b>✅ 已经关联备份账户</b>
        [2] <b>⚠️ 请确认是否移除备份账户</b>
    }

backupAddMsg = 
    <b>{settingBackup}</b> » { NUMBER($action) ->
        *[0] {backupAdd}
        [1] {backupEdit}
    }

    { NUMBER($step) ->
        *[0]
        <b>👉 请发送待关联账户的ID</b>
        (ID可在设置页面查看)

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
inviteUsers = 👤 用户详情
inviteDetail = 🔖 邀请记录
inviteWithdraw = 🎁 提取佣金
inviteWithdrawSuccess = 提取成功，佣金将转入钱包余额
inviteWithdrawFail = 提取失败，没有足够的余额
inviteTime1 = 今日
inviteTime2 = 昨日
inviteTime3 = 本月
inviteTime4 = 全部
inviteUsersMsg = <b>{invite}</b> » {inviteUsers}
inviteMsg = 
    <b>{invite}</b> · <a href="https://google.com/">了解更多 ›</a>

    · Telegram用户点击邀请链接即可完成注册
    · 完成注册新用户将自动成为您的下级代理
    · 您将获得下级代理产生手续费的 <b>50%</b> 作为奖励
    · <a href="https://google.com/">了解更多 ›</a>

    <b>👇 邀请链接(点击可复制)</b>
    <code>{$link}</code>

inviteDetailMsg = 
    <b>{invite}</b> · <a href="https://google.com/">了解更多 ›</a>

    <b>· 邀请用户</b>
       活跃用户: {$count}

    <b>· 获得佣金</b>
       TRC20 · USDT: {$trc20}
       ERC20 · USDT: {$erc20}
       BEP20 · USDT: {$bep20}

    ⚠️ 受您邀请注册的新用户，可获得其手续费的 <b>50%</b> 佣金奖励
# <b>· 我的邀请: </b>
# 今日邀请: {$count1}
# 昨日邀请: {$count2}
# 月度邀请: {$count3}
# 全部邀请: {$count4}
    
# BEP20 · USDT: {$bep20}
# ERC20 · USDT: {$erc20}

## ============================
# 商户集成
paymentNew = 开通支付应用
paymentManage = 管理支付应用
paymentDocument = 使用文档
paymentCreateMsg = 
    <b>{payment}</b> » {paymentNew}
    
    · 前置条件: VIP5或钱包任意币种余额 >= 50
    · 余额转出费用3%，其他任何操作 0 费用

    <b>👉 请确认是否开通支付应用</b>

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
vendingSettingDescribe = 店铺简介
vendingSettingPayment = 付款货币
vendingSettingStatus= { NUMBER($status) ->
    *[0] {vendingStatusClose}
    [1] {vendingStatusOpen}
}
vendingSettingSuccess = ✅ 操作成功 
vendingCreate = 开通店铺
vendingMsg =
    <b>{vending}</b> 
    
    · 开通自动售卖服务，一键触达终端用户
    · 全天候在线自动销售，省时省力更省心
    · <a href="https://google.com/">点我了解更多</a>

    余额转出费用3%，其他无任何费用

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
vendingStatusOpen = 🟢 正在营业
vendingStatusClose = 🟠 暂停营业
vendingSettingTypeMsg =
    <b>{vending}</b> » {vendingSetting}

    { NUMBER($type) ->
        *[1] 
        · 店铺第一印象从名称开始

        <b>👉 请回复店铺名称</b> 
        [2] 
        · 店铺简介,让客户快速了解本店业务

        <b>👉 请回复店铺简介</b> 
        [3] 
        · 设置客户付款货币，默认支持全部币种

        <b>👇 请选择付款货币种类</b> 
    }

vendingUnSetting = (未设置)
vendingSettingMsg =
    <b>{vending}</b> » {vendingSetting}

    · 店铺名称: {$name}
    · 店铺简介: {$describe}
    · 店铺状态: {$status}
    · 付款货币: {$payment}

    <b>👇 请选择设置项</b> 

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
        {vendingTextDesc}=[{$desc}]
        {vendingTextPrice}=[{$price}]
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
    <b>{secured}</b> · <b>{securedAgreement}</b>
    · 本担保交易近管理资金和流程，担保内容和交付由双方自行协定
    · 担保双方应事先协定各项交易准则，服务内容，交付和验收标准
    · 乙方加入时担保开始成立，无法中断，资金款项冻结直至交易完成
    · 流程未正常执行时双方可自行协商，否则流程持续停留当前状态
    · 鼓励诚信交易，若申请人工介入，将扣取双方保证金5%作为裁判费用
    · 经由官方群公布后接受3人申请裁判员，依据担保内容所示投票裁定

    <b>状态流程</b>
     1 · 甲方创建
     2 · 乙方加入
     3 · 交付服务
           (甲方交付/乙方接收)
     4 · 放行款项
           (乙方放款/甲方收款)
     5 · 交易完成

    <b>⚠️ 点击“确认”表示您同意《{securedAgreement}》</b>

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

        <b>👉 请输入担保的交易内容</b>  
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

            <b>👇 请设置缴纳保证金比例</b> 
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