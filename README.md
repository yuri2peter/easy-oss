# easy-oss

阿里云 oss 的对接库，封装了常见的使用场景。

## 准备工作

### 配置阿里云 OSS Bucket

我们以创建一个名为`easy-oss-test`的 oss bucket 为例，步骤如下：

1. 登录[OSS 管理控制台](https://oss.console.aliyun.com/bucket)。
2. 创建一个新的 Bucket，Bucket 命名为 `easy-oss-test`，地区选择杭州。
3. 前往[RAM 创建用户页面](https://ram.console.aliyun.com/users/new)，创建一个新用户，访问方式需要勾选编程访问（可选密码访问）。登录名称：`admin_oss_easy_oss_test`；显示名称：`[OSS](easy-oss-test)管理员`。
4. 创建成功后，妥善保存 AccessKey ID 和 AccessKey Secret，请勿泄露。
5. 前往[新建自定义权限策略页面](https://ram.console.aliyun.com/policies/new)，新建一个描述 oss 管理的策略。策略名称：`admin_oss_easy_oss_test`，配置模式选择“脚本配置”，输入以下策略内容并保存：
   ```
   {
       "Version": "1",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": "oss:*",
               "Resource": [
                   "acs:oss:*:*:easy-oss-test",
                   "acs:oss:*:*:easy-oss-test/*"
               ]
           }
       ]
   }
   ```
6. 前往[RAM 用户管理页面](https://ram.console.aliyun.com/users)，找到我们刚才创建的用户，点击`添加权限`。选择`自定义策略`，添加我们刚才创建的自定义策略`admin_oss_easy_oss_test`并保存。

7. 如果需要在 web 端、小程序端操作 oss，请开启跨域。在对应 oss 的管理页面中，选择“权限管理”->“跨域设置”，创建新的跨域规则。规则需要按照您的实际情况制定，可以先指定一个最宽松的规则，来源：\*，允许的 Methods：全部，允许的 Headers：\* 。

至此，我们已经成功创建了一个 oss bucket 并且为其配置了一个可供编程 API 调用的 RAM 子账户。

## 使用

```javascript
const EasyOss = require('@yuri2/easy-oss');

// 按实际情况配置
const ossOptions = {
  bucket: 'easy-oss-test',
  region: 'oss-cn-hangzhou',
  accessKeyId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  accessKeySecret: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
};

// 创建操作实例
const oss = new EasyOss({ ossOptions });

// 列举当前bucket下所有文件
oss.listPrefix('').then(console.log);
```

## 服务端 API

完善中...

您可[点击这里](./src/index.js)自行查看源码中的注释。

## Web 客户端上传 demo

Demo 文件位于`web_demo`目录下，包含一个在 web 端上传到指定 oss 目录下的示例。
由于上传所需的信息具有时效性，测试 demo 前，请请先运行 `getPostSignatureForUpload` API，并将结果维护到 html 文件的 `options` 中。

## 同步 CNPM

如果 CNPM 没有及时同步最新的软件包，可以访问[@yuri2/easy-oss](https://developer.aliyun.com/mirror/npm/package/@yuri2/easy-oss)，并点击`SYNC`按钮手动同步。
