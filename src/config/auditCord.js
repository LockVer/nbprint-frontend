// 审核详情数据
export default [
    {
        title: "审核内容",
        items: [
            {
                'adTitle': '基本审核项',
                'adItem': [
                    {
                        label: "产品信息",
                        name:'productInf',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '装盒参数',
                        name:'packingParameter',
                        selectedValue: "",
                        errorMessage: ""
                    }
                ]
            },
            {
                'adTitle': '小卡审核项',
                'adItem': [
                    {
                        label: "小卡盒号",
                        name:'smallCardBoxNumber',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '小卡尺寸',
                        name:'smallCardSize',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '小卡边距',
                        name:'smallCardMargin',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '奖符数量',
                        name:'prizeAmount',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '小卡顺序',
                        name:'smallCardSequence',
                        selectedValue: "",
                        errorMessage: ""
                    },
                ]
            },
            {
                'adTitle': '宣传卡审核项',
                'adItem': [
                    {
                        label: "宣传卡盒号",
                        name:'adCardBoxNumber',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '宣传卡奖符边距',
                        name:'adCardPrizeMargin',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '宣传卡边距',
                        name:'adCardMargin',
                        selectedValue: "",
                        errorMessage: ""
                    },
                ]
            },
            {
                'adTitle': 'Payout审核项',
                'adItem': [
                    {
                        label: "标题",
                        name:'title',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '销售总额',
                        name:'totalSales',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '奖符区',
                        name:'lotteryArea',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '返奖区',
                        name:'prizeArea',
                        selectedValue: "",
                        errorMessage: ""
                    },
                    {
                        label: '所用模板',
                        name:'usedTemplate',
                        selectedValue: "",
                        errorMessage: ""
                    }
                ]
            }
        ]
    }
]