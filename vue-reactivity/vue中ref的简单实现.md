# `Vue3`中`ref`的简单实现

> 在`Vue3`中`ref`的实现是依靠类实现的，然后在编译过程中转化成了`defineProperty`，详情请看[RefImple类的编译结果](https://babel.docschina.org/repl/#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&spec=false&loose=false&code_lz=MYGwhgzhAEBKCmAzAkgWwA4mgbwFAEhgB7AOwgBcAnAV2HKMoApKwB3ANTBGvgEocC-cgAsAlhAB0AfQBuXHtAC80Fh3nwA3AQC-uAgHN45aHO7xG_PPnyUj1SiWgjx00zy35dBCEZPrGJPBqZpa40OER4c6SsupK0IHB7jq4ukA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=env%2Ces2015%2Creact%2Cstage-2%2Cenv&prettier=false&targets=&version=7.15.2&externalPlugins=)

类`RefImpl`的简单实现

```js
class RefImpl {
	public _value;
	constructor(public rawValue) {
		this._value = reactive(rawValue);
	}

	get value() {
		track(this, "get", "value");
		return this._value;
	}

	set value(newValue) {
     this._value = newValue;
		 trigger(this, "set", "value", this.rawValue, newValue);
	}
}
```

这里我们利用了之前说过的`track`和`trigger`收集和触发依赖


`computed`的简单实现