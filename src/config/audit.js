// 审核详情数据


export default [
    {
        title: "订单详情",
        items: [
            {
                label: "产品名称",
            },
            {
                label: '客户名称',
            },
            {
                label: '业务员',
            },
            {
                label: '产品名称',
            },
            {
                label: '创建时间',
            }
        ]
    },
    {
        title: "审核内容",
        items: [
            {
                'ad-title': '基本审核项',
                'ad-item': [
                    {
                        label: "产品信息",
                        type: [
                            { text: '正常', value: "1" },
                            { text: '异常', value: "0" }
                        ]
                    },
                    {
                        label: '装盒参数',
                        type: [
                            { text: '正常', value: "1" },
                            { text: '异常', value: "0" }
                        ]
                    }
                ]
            },
            {
                'ad-title': '小卡审核项',
                'ad-item': [
                    {
                        label: "小卡盒号",
                        type: [
                            { text: '正常', value: "1" },
                            { text: '异常', value: "0" }
                        ]
                    },
                    {
                        label: '小卡尺寸',
                        type: [
                            { text: '正常', value: "1" },
                            { text: '异常', value: "0" }
                        ]
                    },
                    {
                        label: '小卡边距',
                        type: [
                            { text: '正常', value: "1" },
                            { text: '异常', value: "0" }
                        ]
                    },
                    {
                        label: '奖符数量',
                        type: [
                            { text: '正常', value: "1" },
                            { text: '异常', value: "0" }
                        ]
                    },
                    {
                        label: '小卡顺序',
                        type: [
                            { text: '正常', value: "1" },
                            { text: '异常', value: "0" }
                        ]
                    },
                ]
            }
        ]
    }
]