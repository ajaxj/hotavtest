<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input 
          v-model="loginForm.email" 
          type="email" 
          id="email" 
          placeholder="请输入邮箱"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input 
          v-model="loginForm.password" 
          type="password" 
          id="password" 
          placeholder="请输入密码"
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';

// 响应式数据
const loginForm = reactive({
  email: '',
  password: ''
});

const loading = ref(false);
const errorMessage = ref('');

// 处理登录逻辑
const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    // 发送 POST 请求到 json-server 的 users 接口
    // 注意：真实的后端通常会有专门的 /login 接口，这里我们模拟查询用户列表
  const response = await axios.post('http://localhost:3000/v1/login', {
    email: loginForm.email,
    password: loginForm.password
});


    // 检查是否找到了匹配的用户
    if (response.data && response.data.length > 0) {

      console.log(response.data);

      // const user = response.data[0];
      // const token = user.token;
      
      // alert(`登录成功！Token: ${token}`);
      
      // TODO: 将 token 存储到 localStorage 或 Vuex/Pinia 中
      // localStorage.setItem('token', token);
      
      // TODO: 跳转到首页
      // router.push('/');
      
    } else {
      errorMessage.value = '邮箱或密码错误';
    }
  } catch (error) {
    console.error('登录请求失败', error);
    errorMessage.value = '网络错误，请稍后重试';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
button:disabled {
  background-color: #a5d6bd;
}
.error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>
