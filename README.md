# easy-oss

阿里云 oss 的对接库，封装了常见的使用场景。

## 准备工作

### 配置阿里云 OSS Bucket

我们以创建一个名为`easy-oss-test`的 oss bucket 为例，步骤如下：

1. 登录[OSS 管理控制台](https://oss.console.aliyun.com/bucket)。
2. 创建一个新的 Bucket，Bucket 命名为 `easy-oss-test`。
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

至此，我们已经成功创建了一个 oss bucket 并且为其配置了一个可供编程 API 调用的 RAM 子账户。

## 使用
