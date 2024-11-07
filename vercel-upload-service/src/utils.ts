const MAX_LEN = 5;

export const generate = () => {
   
    let ans = "";
    const subset = "12hgds456gfjhfjfhvvfkdfdjfg3224";
    for (let i = 0; i < MAX_LEN; i++){
        ans += subset[Math.floor(Math.random() * subset.length)];
    }

    return ans;
}