<template>
    <div  class="statistics">
        <div class="content">

            <div class="table">

                <div class="month-data" v-for="v,k in data">
                    <div class="month">{{k}}</div>

                    <div class="numbers">
                        <div>
                            <div class="label">Multas efectivas</div>
                            <div class="value">{{v.good}}</div>
                        </div>
                        <div>
                            <div class="label">Multas perdidas</div>
                            <div class="value">{{v.lost}}</div>
                        </div>
                        <div>
                            <div class="label">% de pérdida</div>
                            <div class="value">{{v.lostPercentage}}%</div>
                        </div>
                    </div>

                </div>

            </div>

            <CustomButton style="max-width: 120px;margin-left: auto" @click="close" >Cerrar</CustomButton>
        </div>
    </div>
</template>

<script>
    import CustomButton from '../components/CustomButton'
    export default {
        name: "Statistics",
        components:{CustomButton},
        props:{data:{type:Object},opened:{type:Boolean,default:false}},
        methods:{
            close(){
                this.$emit('close')
            }
        }
    }
</script>

<style scoped lang="scss">
    .statistics
    {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.75);
        z-index: 1000;
        display: flex;
        align-items: center;
    }
    .content
    {
        max-width: 500px;
        width: 90%;
        padding: 1rem;
        margin: auto;
        background: white;
    }
    .numbers
    {
        display: grid;
        grid-gap: 0.5rem;
        grid-template-columns: 1fr 1fr 1fr;
    }
    .label
    {
        margin-bottom: 0.5rem;
    }
    .table
    {
        margin-bottom: 1rem;
        grid-gap: 1rem;
        display: grid;
    }
    .month
    {
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
</style>
