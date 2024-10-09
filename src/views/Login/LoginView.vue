<template>
    <div class="login-page">
        <div class="cover">
        </div>
        <div class="login-box">
            <div class="title">登录</div>
            <input class="einput" v-model="username" type="text" placeholder="用户名">
            <input class="einput" v-model="password" type="password" placeholder="密码">
            <button class="ebutton" @click="login">登录</button>
            <p>默认用户名为<b>手机号</b></p>
            <p>默认密码为姓<b>手机号+@King1936</b></p>
            <p>例如：章三 - 13062081022 - 13062081022@King1936</p>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import UserService from '../../services/UserService';
import { useRouter,useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus'
const userService = new UserService();
const username = ref('');
const password = ref('');
const errorMsg = ref('');
const router = useRouter();
const route = useRoute()
const store = useStore();
onMounted(() => {
    // if(route.query.token){
    //     localStorage.setItem('token', route.query.token);
    //     router.push('/opencard');
    // } else {
    //     router.push('/login');
    // }
    window.addEventListener('keyup', handleKeyup);
})
onBeforeUnmount(() => {
    window.removeEventListener('keyup', handleKeyup);
})
const handleKeyup = (event) => {
    if (event.key === 'Enter') {
        login();
    }
}
const login = () => {
    if (username.value === '' || password.value === '') {
        ElMessage.error('用户名或密码不能为空');
        return;
    }
    userService.login({
        username: username.value,
        password: password.value
    }).then((res) => {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo));
        store.dispatch('setUserInfo', res.data.userInfo);
        router.push('/opencard');
    }).catch((err) => {
        console.log(err);
        ElMessage.error(err);
    });
}

</script>
<style lang="scss" scoped>
.login-page {
    display: flex;
    height: 100vh;
    width: 100vw;

    .cover {
        flex: 1;
        background: url('../../assets/login-bg.png') no-repeat center center;
        background-size: cover;
    }

    .login-box {
        width: 400px;
        padding: 30px;
        background-color: #fff;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .title {
            font-size: 36px;
            margin-bottom: 20px;
            font-weight: bold;
        }

        .ebutton {
            margin-bottom: 20px;
        }

        p {
            padding: 0;
            margin: 0;
            margin-bottom: 5px;
            color: #909090;
            font-size: 14px;
        }

        .error-msg {
            color: red;
            font-size: 14px;
            margin-bottom: 20px;
        }
    }
}
</style>