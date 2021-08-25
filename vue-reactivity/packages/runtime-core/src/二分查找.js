const arr = [1, 2, 4, 5, 6, 4, 3, 12, 3, 45, 5]
        //   0  1  2  3  4  5  6  7  8   9   10

function getSequence(arr) {
    const len = arr.length;
    let start, middle, end;
    const result = [0]; //放索引
    const test = [1]
    for (let i = 1; i < len; i++) {
        const arrI = arr[i];
        if(arrI !== 0){
            let resultLastIndex = result[result.length - 1];
            if(arr[resultLastIndex] < arrI){
                result.push(i);
                test.push(arrI)
                continue
            }
            start = 0;
            end = result.length - 1;
            while(start < end){
                middle = ((start + end)/2) | 0;
                if(arr[result[middle]] < arrI){
                    start = middle + 1
                }else{
                    end = middle
                }
            }

            if(arrI < arr[result[start]]){
                result[start] = i;
                test[start] = arrI

            }

        }
    }
    console.log(test);
    console.log(result);
}


getSequence(arr)