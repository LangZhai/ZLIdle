var
// 主程序
    main,
// 主程序定时器
    interval,
// 时间变量
    time, now,
// 天数
    dayNum,
// 人口
    normalPeople, badPeople, freelessPeople, deadPeople, normalOld, badOld, freelessOld, deadOld,
// 金钱相关
    money, moneyRate,
// 是否已发生瘟疫
    isPlague,
// 是否已结束
    isOver,
// 瘟疫爆发率
    plagueRate,
// 囚犯释放队列
    timeout,
// 可设置游戏数据
    setting,
// 罪名
    crime,
// 减法计算
    minus = function (people, callback) {
        people--;
        if (people < 0) {
            people = 0;
        } else {
            callback();
        }
        return people;
    },
// 概率计算
    rateDeal = function (rate, callback) {
        if (Math.random() * 100 <= rate) {
            callback();
        }
    },
// 犯罪计算
    crimeDeal = function (people, isAgain) {
        var i, day, isDead, rate = isAgain ? setting.crimeAgainRate : setting.crimeRate;
        for (i = 0; i < people; i++) {
            day = 0;
            isDead = false;
            rateDeal(rate, function () {
                //TODO:这里的计算需要重新考虑
                crime.forEach(function (item) {
                    if (isDead) {
                        return;
                    }
                    rateDeal(item.rate, function () {
                        if (item.day === 0) {
                            day = 0;
                            isDead = true;
                            if (isAgain) {
                                badPeople = minus(badPeople, function () {
                                    deadPeople++;
                                });
                            } else {
                                normalPeople = minus(normalPeople, function () {
                                    deadPeople++;
                                });
                            }
                        } else {
                            day += item.day;
                        }
                    });
                });
                if (!day && !isDead) {
                    day = crime[0].day;
                }
            });
            if (day) {
                if (isAgain) {
                    badPeople = minus(badPeople, function () {
                        freelessPeople++;
                    });
                } else {
                    normalPeople = minus(normalPeople, function () {
                        freelessPeople++;
                    });
                }
                timeout.push(setTimeout(function () {
                    badPeople += 1;
                }, 1000 / setting.speed * day));
            }
        }
    },
// 出生/死亡计算
    newDeal = function (people, rate) {
        var i, num = 0;
        for (i = 0; i < people; i++) {
            rateDeal(rate, function () {
                num++;
            });
        }
        return num;
    },
// 显示增减人数
    showNum = function (oldNum, newNum, $plus, $minus) {
        if (newNum > oldNum) {
            $plus.text('+' + (newNum - oldNum)).removeClass('plus').animate({}, 0, function () {
                $plus.addClass('plus');
            });
        } else if (newNum < oldNum) {
            $minus.text(newNum - oldNum).removeClass('minus').animate({}, 0, function () {
                $minus.addClass('minus');
            });
        }
    },
// 暂停或继续
    pauseOrResume = function (isResume) {
        if (isOver) {
            return;
        }
        if (isResume) {
            if (now - time <= 10000) {
                time = new Date().getTime();
            }
            interval = setInterval(main, 1000 / setting.speed);
        } else {
            clearInterval(interval);
        }
    },
// 程序初始化
    init = function () {
        dayNum = 0;
        normalPeople = 10000;
        badPeople = 0;
        freelessPeople = 0;
        deadPeople = 0;
        normalOld = 0;
        badOld = 0;
        freelessOld = 0;
        deadOld = 0;
        money = 0;
        moneyRate = 2;
        isPlague = false;
        isOver = true;
        plagueRate = .1;
        timeout = [];
        setting = {
            // 游戏速度
            speed: 10,
            // 犯罪率
            crimeRate: .1,
            // 再犯罪率
            crimeAgainRate: .5,
            // 出生率
            newRate: .1,
            // 死亡率
            deadRate: .1,
            // 修改花费
            cost: 0
        };
        crime = [{
            name: '盗窃',
            rate: 25,
            day: 10
        }, {
            name: '嫖娼',
            rate: 25,
            day: 10
        }, {
            name: '抢劫',
            rate: 12,
            day: 30
        }, {
            name: '行贿',
            rate: 12,
            day: 30
        }, {
            name: '贪污',
            rate: 8,
            day: 100
        }, {
            name: '伤人',
            rate: 8,
            day: 150
        }, {
            name: '卖淫',
            rate: 4,
            day: 500
        }, {
            name: '强奸',
            rate: 3,
            day: 700
        }, {
            name: '贩毒',
            rate: 2,
            day: 1000
        }, {
            name: '杀人',
            rate: 1,
            day: 0
        }];
    };

$(function () {
    var
    // 循环变量
        i,
    // 死亡人数变量
        normalDead, badDead, freelessDead,
    // 头部jQuery变量
        $headerDivs = $('header h2 div'), $day = $headerDivs.eq(0), $start = $headerDivs.eq(1), $dayText = $day.children('span'), $peopleText = $day.find('p span'),
    // 导航栏jQuery变量
        $navBtns = $('header nav > span'), $money = $navBtns.eq(0).children(), $setBtn = $navBtns.eq(1), $helpBtn = $navBtns.eq(2),
    // 中间jQuery变量
        $sectionFigures = $('section figure'), $normal = $sectionFigures.eq(0).children('span:first'), $normalPlus = $normal.next(), $normalMinus = $normalPlus.next(), $bad = $sectionFigures.eq(1).children('span:first'), $badPlus = $bad.next(), $badMinus = $badPlus.next(), $freeless = $sectionFigures.eq(2).children('span:first'), $freelessPlus = $freeless.next(), $freelessMinus = $freelessPlus.next(), $dead = $sectionFigures.eq(3).children('span:first'), $deadPlus = $dead.next(), $deadMinus = $deadPlus.next(),
    // 尾部jQuery变量
        $footerText = $('footer p:first'),
    // 设置框jQuery变量
        $setting = $('#setting'), $form = $setting.children(), $cost = $form.find('#cost'), $input = $form.find(':input'),
    // 设置框关闭
        closeDialog,
    // 设置框参数
        dialogOption = {
            title: '依法治国-设置',
            size: {width: 350},
            buttons: [{
                text: '确定',
                callback: function () {
                    var formData = $('.ZLDialog:first form:first').serializeObject();
                    if (money < formData.cost) {
                        return;
                    }
                    money -= formData.cost;
                    if (formData.cost > 0) {
                        formData.cost = Math.ceil(formData.cost * 1.2);
                    } else {
                        formData.cost = 1;
                    }
                    $.extend(setting, formData);
                    closeDialog();
                }
            }, {text: '取消'}],
            closeBack: function () {
                pauseOrResume(true);
            }
        }, dialogOptionPlague = $.extend(true, {}, dialogOption),
    // 帮助框参数
        dialogOptionHelp = {
            title: '依法治国-帮助',
            size: {
                width: 300
            },
            content: '<h3>游戏玩法</h3><p>　　游戏起始人口为10000人，游戏总天数为2000天，你需要收集随机产生的金钱来修改游戏参数，使人口数量维持在10000左右，在游戏结束时，人口数量误差在5%以内算胜利！</p><p>　　游戏中有一定概率遭遇“瘟疫横行”，建议预留研制药物所需资金！</p><h3>关于游戏</h3><p>版本：V1.0.0</p><p>作者：智能小菜菜</p><p>邮箱：<a href=\'mailto:zl2012xyz@hotmail.com\'>zl2012xyz@hotmail.com</a></p>',
            closeBack: function () {
                pauseOrResume(true);
            }
        },
    // 结束游戏
        over = function () {
            init();
            $start.removeClass('hidden');
            $day.addClass('hidden');
        };

    // 设置框参数（瘟疫）
    dialogOptionPlague.buttons.push({
        text: '抗击瘟疫！',
        callback: function () {
            isPlague = false;
            $footerText.text('');
            closeDialog();
        }
    });

    // 主程序定义
    main = function () {
        var newRate, deadRate;
        now = new Date().getTime();
        if (now - time > 5000) {
            clearInterval(interval);
            $footerText.text('程序过于卡顿，游戏结束！');
            over();
            return;
        }
        if (now - time > 1000 / setting.speed * 2) {
            setting.speed /= 2;
        }
        time = now;

        // 金钱计算
        for (i = 0; i < 3; i++) {
            rateDeal(moneyRate, function () {
                money++;
            });
        }
        $money.text(money);

        // 犯罪计算
        crimeDeal(normalPeople);
        crimeDeal(badPeople, true);

        if (isPlague) {
            newRate = setting.newRate * .1;
            deadRate = setting.deadRate * 10;
        } else {
            newRate = setting.newRate;
            deadRate = setting.deadRate;
        }

        // 普通人出生死亡
        normalPeople += newDeal((normalPeople + badPeople + freelessPeople), newRate);
        normalDead = Math.min(newDeal(normalPeople, deadRate), normalPeople);
        normalPeople -= normalDead;

        // 刑满人死亡
        badDead = Math.min(newDeal(badPeople, deadRate), badPeople);
        badPeople -= badDead;

        // 服刑人死亡
        freelessDead = Math.min(newDeal(freelessPeople, deadRate), freelessPeople);
        timeout.splice(freelessPeople.length - freelessDead, freelessDead).forEach(function (item) {
            clearTimeout(item);
        });
        freelessPeople -= freelessDead;

        deadPeople += normalDead + badDead + freelessDead;
        $dayText.text(++dayNum);
        $peopleText.text(normalPeople + badPeople + freelessPeople);
        $normal.text(normalPeople);
        $bad.text(badPeople);
        $freeless.text(freelessPeople);
        $dead.text(deadPeople);

        // 显示增减人数
        showNum(normalOld, normalPeople, $normalPlus, $normalMinus);
        showNum(badOld, badPeople, $badPlus, $badMinus);
        showNum(freelessOld, freelessPeople, $freelessPlus, $freelessMinus);
        showNum(deadOld, deadPeople, $deadPlus, $deadMinus);

        // 瘟疫计算
        if (!isPlague) {
            rateDeal(plagueRate, function () {
                isPlague = true;
                $footerText.text('瘟疫正在横行！');
            });
        }

        if (normalPeople + badPeople + freelessPeople === 0) {
            clearInterval(interval);
            $footerText.text('人类在第' + dayNum + '天灭亡，游戏结束！');
            over();
        }
        if (dayNum === 2000) {
            clearInterval(interval);
            if (Math.abs(normalPeople + badPeople + freelessPeople - 10000) < 10000 * 0.05) {
                $footerText.text('你获得了胜利！');
                over();
            } else {
                $footerText.text('你失败了！');
                over();
            }
        }
        normalOld = normalPeople;
        badOld = badPeople;
        freelessOld = freelessPeople;
        deadOld = deadPeople;
    };

    // 开始按钮点击
    $start.on('click', function () {
        isOver = false;
        $day.removeClass('hidden');
        $start.addClass('hidden');
        $dayText.text(dayNum);
        $peopleText.text(normalPeople + badPeople + freelessPeople);
        $normal.text(normalPeople);
        $bad.text(badPeople);
        $freeless.text(freelessPeople);
        $dead.text(deadPeople);
        $footerText.text('');
        pauseOrResume(true);
    });

    // 帮助按钮点击
    $helpBtn.on('click', function () {
        pauseOrResume();
        $.dialog(dialogOptionHelp);
    });

    // 设置按钮点击
    $setBtn.on('click', function () {
        if (isOver) {
            return;
        }
        pauseOrResume();
        Object.keys(setting).forEach(function (key) {
            $input.filter('[name=' + key + ']').val(setting[key]).attr('value', setting[key]);
        });
        $cost.text(setting.cost);
        closeDialog = $setting.dialog(isPlague ? dialogOptionPlague : dialogOption);
    });

    init();
});