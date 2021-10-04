<template>
  <div class="login-container" :style="{backgroundImage:`url(${imgSrc})`}">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="on" label-position="left">

      <div class="title-container">
        <h3 class="title">Go Web Mini</h3>
      </div>

      <el-form-item prop="account">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input
          ref="account"
          v-model="loginForm.account"
          placeholder="用户账号"
          name="account"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="密码"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </el-form-item>
      </el-tooltip>
      <el-form-item prop="code" >
        <el-input
          ref="account"
          v-model="loginForm.code"
          placeholder="验证码"
          name="code"
          type="text"
          tabindex="3"
          maxlength="6"
          autocomplete="off"
          style="width: 50%; float: left;"
          @keyup.enter.native="handleLogin"
        />
        <div
                class="login-code"
                style="
                  cursor: pointer;
                  width: 30%;
                  float: right;
                  height: 48px;
                  background-color: #f0f1f5;
                "
              >
                <img
                  style="
                    height: 48px;
                    width: 100%;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 5px;
                  "
                  :src="codeUrl"
                  @click="getCode"
                >
            </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 25px;color:white">记住密码</el-checkbox>
      <el-button :loading="loading" type="primary" class="login-btn" @click.native.prevent="handleLogin">
      <span v-if="!loading">Login</span>
      <span v-else>Logging in...</span>
      </el-button>

    </el-form>

  </div>
</template>

<script>
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { getCodeImg } from '@/api/system/base'
import Cookies from "js-cookie";

export default {
  name: 'Login',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }
    return {
      imgSrc: require('@/assets/backgd-image/backimg.jpg'),
      codeUrl: '',
      loginForm: {
        rememberMe:false,
        account: '',
        password: '',
        code: '',
        uuid: ''
      },
      loginRules: {
        account: [{ required: true, trigger: 'blur' }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        code: [{ required: true, trigger: 'change', message: '验证码不能为空' } ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
     this.getCode()
     this.getCookie();
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.account === '') {
      this.$refs.account.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    getCode() {
      getCodeImg().then((res) => {
        if (res !== undefined) {
          this.codeUrl = res.data.b64s
          this.loginForm.uuid = res.data.uuid
        }
      })
    },
    getCookie() {
          const account = Cookies.get("account");
          const password = Cookies.get("password");
          const rememberMe = Cookies.get('rememberMe')
          this.loginForm = {
            account: account === undefined ? this.loginForm.account : account,
            password: password === undefined ? this.loginForm.password : decrypt(password),
            rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
          };
        },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
           if (this.loginForm.rememberMe) {
              Cookies.set("account", this.loginForm.account, { expires: 30 });
              Cookies.set("password", encrypt(this.loginForm.password), { expires: 30 });
              Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 });
            } else {
              Cookies.remove("account");
              Cookies.remove("password");
              Cookies.remove('rememberMe');
            }
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
              this.getCode()
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#5c646d;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: $bg;
    border-radius: 5px;
    color: #454545;
    margin-left: 20px;
    margin-right: 20px;
  }

  .login-btn{
    width: calc(100% - 40px);
    height: 45px;
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 30px;
    border: 0;
    font-size: 16px;
    font-weight: bold;
    // opacity: 0.9;
    border-radius: 20px;
    background-image: linear-gradient(to right, #74ebd5 0%, #9face6 100%);
  }

  .login-btn:hover{
    color: greenyellow;
    background-image: linear-gradient(to right, #eea2a2 0%, #bbc1bf 19%, #57c6e1 42%, #b49fda 79%, #7ac5d8 100%);
  }
}
</style>

<style lang="scss" scoped>
$bg:#5c646d;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  height: 100%;
  background-color: $bg;
  // overflow: hidden;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form {
    // position: relative;
    width: 520px;
    max-width: 100%;
    // padding: 160px 35px 0;
    // margin: 0 auto;
    background-color: rgba(0,0,0,0.5);
    // overflow: hidden;
    border-radius: 8px;
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 20px auto 20px auto;
      text-align: center;
      font-weight: bold;
      // letter-spacing: 2px;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
