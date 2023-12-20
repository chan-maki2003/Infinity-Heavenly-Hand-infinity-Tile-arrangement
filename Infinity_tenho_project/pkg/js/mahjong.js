const KINDS = {
    SUUPAI: ['m', 'p', 's'],
    JIHAI: ['sufon', 'sangen']
}
const SUUPAI_VALUE = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const SUFONPAI_VALUE = [1, 2, 3, 4];
const SANGENPAI_VALUE = [1, 2, 3];
// const SUFONPAI_VALUE = {
//     1:'東',
//     2:'南',
//     3:'西',
//     4:'北'
// };
// const SANGENPAI_VALUE = {
//     1:'白',
//     2:'發',
//     3:'中'
// };
const MENTSU_KINDS = ['順子', '刻子']

//麻雀牌クラス
class Hai {
    //コンストラクタ
    constructor(kind, value) {
        this.kind = kind;       //麻雀牌の種類（萬子・筒子・索子・四風牌・三元牌）
        this.value = value;     //麻雀牌の値（1~9 東南西北白発中）
        this.pic = this.kind + String(this.value) + '.jpg'; //画像ファイル名
    }

    //ソートキーを返却
    getSortKey() {
        switch (this.kind) {
            case KINDS.SUUPAI[0]:
                return Number('1' + String(this.value));
            case KINDS.SUUPAI[1]:
                return Number('2' + String(this.value));
            case KINDS.SUUPAI[2]:
                return Number('3' + String(this.value));
            case KINDS.JIHAI[0]:
                return Number('4' + String(this.value));
            case KINDS.JIHAI[1]:
                return Number('5' + String(this.value));
            default:
                throw new TypeError('Hai.kind is not undefined');
        }
    }

    //イコールメソッド
    equals(hai) {
        return hai.kind == this.kind && hai.value == this.value
    }
}

//あがり牌クラス
class Agari {
    //コンストラクタ
    constructor(yaku, arrayHai, janto, mentsu1, mentsu2, mentsu3, mentsu4) {
        this.yaku = yaku;
        this.arrayHai = arrayHai;
        this.janto = janto;
        this.mentsu1 = mentsu1;
        this.mentsu2 = mentsu2;
        this.mentsu3 = mentsu3;
        this.mentsu4 = mentsu4;
    }
}

//雀頭
class Janto {
    //コンストラクタ
    constructor(arrayHai) {
        this.arrayHai = arrayHai;
    }
}

//面子
class Mentsu {
    //コンストラクタ
    constructor(kind, arrayHai) {
        this.kind = kind;
        this.arrayHai = arrayHai;
    }
}


//麻雀牌オブジェとのソート用関数
function sortHai(a, b) {
    return a.getSortKey() - b.getSortKey();
}

//山牌作成
function createYamahai() {
    // 配列ランダムソート（シャッフル）関数
    let shuffleArray = (arr) => {
        let n = arr.length;
        let temp = 0, i = 0;
        while (n) {
            i = Math.floor(Math.random() * n--);
            temp = arr[n];
            arr[n] = arr[i];
            arr[i] = temp;
        }
        return arr;
    }
    //山牌作成ジェネレーター
    let yamahaiGenerator = function* (kinds, values) {
        for (let kind of kinds) {
            for (let value of values) {
                for (let i = 0; i < 4; i++) {
                    yield new Hai(kind, value);
                }
            }
        }
    };
    //山牌返却
    return shuffleArray([...yamahaiGenerator(KINDS.SUUPAI, SUUPAI_VALUE)
        , ...yamahaiGenerator([KINDS.JIHAI[0]], SUFONPAI_VALUE)
        , ...yamahaiGenerator([KINDS.JIHAI[1]], SANGENPAI_VALUE)]);
}

//あがり判定
function judge(tehai) {
    agari = [];

    //雀頭
    jantoArray = findDuplicate(tehai, 2);

    if (jantoArray.length === 0) {
        return false;
    }

    //国士無双
    if (checkKokushimusou(tehai, jantoArray)) {
        //return new Agari('国士無双',tehai,null,null,null,null,null);
        return true;
    }

    //七対子
    if (jantoArray.length === 7) {
        agari = agari.concat(new Agari('七対子', tehai, null, null, null, null, null));
    }

    //通常役
    for (let janto of jantoArray) {
        let copy = Object.assign([], tehai);
        removeElement(copy, janto);
        removeElement(copy, janto);

        copy.sort(sortHai);

        //刻子の種類
        koutsuArray = findDuplicate(copy, 3);

        //刻子が０個のパターン
        agari = agari.concat(agariKoutsu0(copy, janto))

        //刻子が１個のパターン
        agari = agari.concat(agariKoutsu1(copy, janto, koutsuArray))

        //刻子が２個のパターン
        agari = agari.concat(agariKoutsu2(copy, janto, koutsuArray))

        //刻子が３個のパターン
        agari = agari.concat(agariKoutsu3(copy, janto, koutsuArray))

        //刻子が４個のパターン
        agari = agari.concat(agariKoutsu4(janto, koutsuArray))
    }

    return agari.length > 0
}

//重複要素取得
//duplicateCount：重複数
function findDuplicate(array, duplicateCount) {
    let setArray = array.filter((val, index, self) =>
        self.findIndex(n => val.equals(n)) === index);
    let result = setArray.filter(val =>
        (array.filter(n => val.equals(n)).length >= duplicateCount));
    return result.sort(sortHai);
}

//配列に特定の要素があるか確認
//存在する場合：true
function checkAvailability(array, val) {
    return array.some(arrVal => val.equals(arrVal));
}

//配列から特定の要素を削除
function removeElement(array, val) {
    let index = array.findIndex(arrVal => val.equals(arrVal));
    array.splice(index, 1);
}

//順子をひとつ見つける
function findOneSyuntsu(arrayHai) {
    arrayHai.sort(sortHai);

    for (let hai of arrayHai) {
        let syuntsu = createSyuntsu(hai);
        if (syuntsu == null) {
            continue;
        }
        if (checkAvailability(arrayHai, syuntsu.arrayHai[0])
            && checkAvailability(arrayHai, syuntsu.arrayHai[1])
            && checkAvailability(arrayHai, syuntsu.arrayHai[2])) {
            return syuntsu;
        }
    }
    throw new RangeError('No Mentsu');
}

//自身を一番最初とした順子を返却
function createSyuntsu(hai) {
    if (KINDS.SUUPAI.includes(hai.kind) && hai.value <= 7) {
        return new Mentsu(MENTSU_KINDS[0],
            [new Hai(hai.kind, hai.value)
                , new Hai(hai.kind, hai.value + 1)
                , new Hai(hai.kind, hai.value + 2)]);
    }
    return null;
}


//刻子が０個のあがりパターン
function agariKoutsu0(arrayHai, janto) {
    try {
        let copy = Object.assign([], arrayHai);

        let first = findOneSyuntsu(copy);
        removeElement(copy, first.arrayHai[0]);
        removeElement(copy, first.arrayHai[1]);
        removeElement(copy, first.arrayHai[2]);

        let second = findOneSyuntsu(copy);
        removeElement(copy, second.arrayHai[0]);
        removeElement(copy, second.arrayHai[1]);
        removeElement(copy, second.arrayHai[2]);

        let third = findOneSyuntsu(copy);
        removeElement(copy, third.arrayHai[0]);
        removeElement(copy, third.arrayHai[1]);
        removeElement(copy, third.arrayHai[2]);

        let fourth = findOneSyuntsu(copy);

        return [new Agari(new Janto([janto, janto]),
            first, second, third, fourth)];
    } catch (e) {
        return [];
    }
}

//刻子が１個のあがりパターン
function agariKoutsu1(arrayHai, janto, koutsuArray) {
    if (koutsuArray.length < 1) {
        return [];
    }

    let result = [];
    for (let koutsu of koutsuArray) {
        try {
            let copy = Object.assign([], arrayHai);

            let first = new Mentsu(MENTSU_KINDS[1], [koutsu, koutsu, koutsu]);
            removeElement(copy, first.arrayHai[0]);
            removeElement(copy, first.arrayHai[1]);
            removeElement(copy, first.arrayHai[2]);

            let second = findOneSyuntsu(copy);
            removeElement(copy, second.arrayHai[0]);
            removeElement(copy, second.arrayHai[1]);
            removeElement(copy, second.arrayHai[2]);

            let third = findOneSyuntsu(copy);
            removeElement(copy, third.arrayHai[0]);
            removeElement(copy, third.arrayHai[1]);
            removeElement(copy, third.arrayHai[2]);

            let fourth = findOneSyuntsu(copy);

            result.push([new Agari(new Janto([janto, janto]),
                first, second, third, fourth)]);
        } catch (e) {
            continue;
        }
    }
    return result;
}

//刻子が２個のあがりパターン
function agariKoutsu2(arrayHai, janto, koutsuArray) {
    if (koutsuArray.length < 2) {
        return [];
    }

    let result = [];
    for (let i = 0; i < koutsuArray.length - 1; i++) {
        for (let j = i + 1; j < koutsuArray.length; j++) {
            try {
                let copy = Object.assign([], arrayHai);

                let first = new Mentsu(MENTSU_KINDS[1], [koutsuArray[i], koutsuArray[i], koutsuArray[i]]);
                removeElement(copy, first.arrayHai[0]);
                removeElement(copy, first.arrayHai[1]);
                removeElement(copy, first.arrayHai[2]);

                let second = new Mentsu(MENTSU_KINDS[1], [koutsuArray[j], koutsuArray[j], koutsuArray[j]]);
                removeElement(copy, second.arrayHai[0]);
                removeElement(copy, second.arrayHai[1]);
                removeElement(copy, second.arrayHai[2]);

                let third = findOneSyuntsu(copy);
                removeElement(copy, third.arrayHai[0]);
                removeElement(copy, third.arrayHai[1]);
                removeElement(copy, third.arrayHai[2]);

                let fourth = findOneSyuntsu(copy);

                result.push([new Agari(new Janto([janto, janto]),
                    first, second, third, fourth)]);
            } catch (e) {
                continue;
            }
        }
    }
    return result;
}

//刻子が３個のあがりパターン
function agariKoutsu3(arrayHai, janto, koutsuArray) {
    if (koutsuArray.length != 3) {
        return [];
    }

    try {
        let copy = Object.assign([], arrayHai);

        let first = new Mentsu(MENTSU_KINDS[1], [koutsuArray[0], koutsuArray[0], koutsuArray[0]]);
        removeElement(copy, first.arrayHai[0]);
        removeElement(copy, first.arrayHai[1]);
        removeElement(copy, first.arrayHai[2]);

        let second = new Mentsu(MENTSU_KINDS[1], [koutsuArray[1], koutsuArray[1], koutsuArray[1]]);
        removeElement(copy, second.arrayHai[0]);
        removeElement(copy, second.arrayHai[1]);
        removeElement(copy, second.arrayHai[2]);

        let third = new Mentsu(MENTSU_KINDS[1], [koutsuArray[2], koutsuArray[2], koutsuArray[2]]);
        removeElement(copy, third.arrayHai[0]);
        removeElement(copy, third.arrayHai[1]);
        removeElement(copy, third.arrayHai[2]);

        let fourth = findOneSyuntsu(copy);

        return [new Agari(new Janto([janto, janto]),
            first, second, third, fourth)];
    } catch (e) {
        return [];
    }
}

//刻子が４個のあがりパターン
function agariKoutsu4(janto, koutsuArray) {
    if (koutsuArray.length != 4) {
        return [];
    }

    return [new Agari(new Janto([janto, janto]),
        new Mentsu(MENTSU_KINDS[1], [koutsuArray[0], koutsuArray[0], koutsuArray[0]]),
        new Mentsu(MENTSU_KINDS[1], [koutsuArray[1], koutsuArray[1], koutsuArray[1]]),
        new Mentsu(MENTSU_KINDS[1], [koutsuArray[2], koutsuArray[2], koutsuArray[2]]),
        new Mentsu(MENTSU_KINDS[1], [koutsuArray[3], koutsuArray[3], koutsuArray[3]]))];
}

//国士無双のチェック（前提として雀頭があること）
function checkKokushimusou(tehai) {
    if (
        checkAvailability(tehai, new Hai(KINDS.SUUPAI[0], SUUPAI_VALUE[0])) &&
        checkAvailability(tehai, new Hai(KINDS.SUUPAI[0], SUUPAI_VALUE[8])) &&
        checkAvailability(tehai, new Hai(KINDS.SUUPAI[1], SUUPAI_VALUE[0])) &&
        checkAvailability(tehai, new Hai(KINDS.SUUPAI[1], SUUPAI_VALUE[8])) &&
        checkAvailability(tehai, new Hai(KINDS.SUUPAI[2], SUUPAI_VALUE[0])) &&
        checkAvailability(tehai, new Hai(KINDS.SUUPAI[2], SUUPAI_VALUE[8])) &&
        checkAvailability(tehai, new Hai(KINDS.JIHAI[0], SUFONPAI_VALUE[0])) &&
        checkAvailability(tehai, new Hai(KINDS.JIHAI[0], SUFONPAI_VALUE[1])) &&
        checkAvailability(tehai, new Hai(KINDS.JIHAI[0], SUFONPAI_VALUE[2])) &&
        checkAvailability(tehai, new Hai(KINDS.JIHAI[0], SUFONPAI_VALUE[3])) &&
        checkAvailability(tehai, new Hai(KINDS.JIHAI[1], SANGENPAI_VALUE[0])) &&
        checkAvailability(tehai, new Hai(KINDS.JIHAI[1], SANGENPAI_VALUE[1])) &&
        checkAvailability(tehai, new Hai(KINDS.JIHAI[1], SANGENPAI_VALUE[2]))
    ) {
        return true;
    } else {
        return false;
    }
}


const TEST_TEHAI = ['23333444556688', '22333456667788', '22344445556677', '11123334445577', '22223344455677', '11555677788899'];

function createTestTehai(index) {
    return Array.from(TEST_TEHAI[index]).map(n => new Hai(KINDS.SUUPAI[0], Number(n)));
}
function checkTestTehai() {
    for (let i = 0; i < TEST_TEHAI.length; i++) {
        let tehai = createTestTehai(i);
        // console.log(TEST_TEHAI[i]);
        // console.log(judge(tehai));
        if (!judge(tehai)) {
            console.log('失敗')
        }
    }
}
