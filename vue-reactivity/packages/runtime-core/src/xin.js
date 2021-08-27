// const arr = [1, 2, 4, 5, 6, 4, 3, 12, 3, 45, 5]
//   0  1  2  3  4  5  6  7  8   9   10
// const arr = [2, 3, 1, 5, 6, 8, 7, 9, 4]
const arr = [1, 4, 3, 7, 6, 8, 5, 9]
function getSequence(arr) {
    const result = [0] // 默认保存arr中第一个元素的节点索引
    const prevIndexResult = new Array(arr.length).fill(-1)// 循环每个元素后，保存当前元素前面的元素索引。标识位置
    for (let i = 1; i < arr.length; i++) {
        const curr = arr[i]; // 当前循环到的元素
        if (curr !== 0) {
            const resultLastIndex = result[result.length - 1];
            if (curr > arr[resultLastIndex]) { // 如果大于保存的上一个索引对应的元素
                result.push(i); // 保存，继续循环下一个
                prevIndexResult[i] = resultLastIndex //保存前一个元素的索引
                continue
            }
            // 如果当前元素小于上一个保存的索引对应的元素,使用二分方式查找
            let start = 0, end = result.length - 1, middle;
            while (start < end) {
                middle = ((start + end) / 2) | 0; // 取result中间的索引
                if (curr < arr[result[middle]]) {
                    end = middle
                } else {
                    start = middle + 1
                }
            }
            // 为了尽可能小，如果小于当前值，则直接替换
            if (curr < arr[result[start]]) {
                result[start] = i;
                if (start > 0) {
                    prevIndexResult[i] = result[start - 1]
                }
            }
        }
    }
    console.log(prevIndexResult);
    let resultLen = result.length;
    let last = result[resultLen - 1];
    
    while(resultLen-- > 0){
        result[resultLen] = arr[last]; //将result内容替换为真实的元素
        last = prevIndexResult[last]; //当前元素前面的元素索引
    }
    console.log(result);
}



getSequence(arr)