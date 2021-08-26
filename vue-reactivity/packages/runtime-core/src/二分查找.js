// const arr = [1, 2, 4, 5, 6, 4, 3, 12, 3, 45, 5]
//   0  1  2  3  4  5  6  7  8   9   10
const arr = [2, 3, 1, 5, 6, 8, 7, 9, 4]
// const arr = [1, 4, 3, 7, 6, 8, 5, 9]
function getSequence(arr) {
    const len = arr.length;
    let start, middle, end;
    const result = [0]; //放索引
    const p = arr.slice(0); //保存arr中每个元素排序后的前一个元素的索引
    const test = [arr[0]]
    for (let i = 1; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            let resultLastIndex = result[result.length - 1];
            if (arr[resultLastIndex] < arrI) {
                result.push(i);
                p[i] = resultLastIndex
                test.push(arrI);
                continue
            }
            start = 0;
            end = result.length - 1;
            while (start < end) {
                middle = ((start + end) / 2) | 0;
                if (arr[result[middle]] < arrI) {
                    start = middle + 1
                } else {
                    end = middle
                }
            }

            if (arrI < arr[result[start]]) {
                if (start > 0) {
                    p[i] = result[start - 1]
                }
                result[start] = i;
                test[start] = arrI

            }
        }

    }
    let resultLen = result.length;
    let last = result[resultLen - 1];
    while (resultLen-- > 0) {
        result[resultLen] = arr[last];
        last = p[last];
    }
    console.log(result);
}


getSequence(arr)