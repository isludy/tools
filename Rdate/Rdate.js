Date.prototype.format = function (format, time) {
	var date = new Date();
	time = time || this.getTime();
	date.setTime(time);
	var o = {
		Y: date.getFullYear(),
		m: date.getMonth()+1,
		d: date.getDate(),
		h: date.getHours(),
		i: date.getMinutes(),
		s: date.getSeconds(),
		c: date.getMilliseconds()
	};
	o.y = (o.Y+'').slice(2);
	o.M = (o.m+100+'').slice(1);
	o.D = (o.d+100+'').slice(1);
	o.H = (o.h+100+'').slice(1);
	o.I = (o.i+100+'').slice(1);
	o.S = (o.s+100+'').slice(1);
	o.C = (o.c+1000+'').slice(1);
	if(typeof format === 'string'){
		format = format.split('');
		for(var len=format.length; len--;){
			var k = format[len];
			if(o[k]) format[len] = o[k];
		}
		return format.join('');
	}
	return o.Y + '/' + o.M + '/' + o.D + ' ' + o.H + ':' + o.I + ':' + o.S + ':' + o.C;
}
Date.prototype.lastDate = function (year, month) {
	var date = new Date();
	if(typeof year === 'number' && year > 0)
		date.setFullYear(year);
	if(typeof month === 'number' && month <= 12 && month > 0)
		date.setMonth(month);
	else
		date.setMonth(this.getMonth()+1);
	date.setDate(0);
	return date.getDate();
}
Date.prototype.dateBetween = function(start, end){
	var list = [];
	start = new Date(start).getTime();
	end = new Date(end).getTime()+86400000;
	for(; start < end; start += 86400000){
		list.push(this.format('Y/M/D',start));
	}
	return list;
}
Date.prototype.dateTable = function (year, month, o) {
	var date = new Date(), last, beforeDays, afterDays, startTime, total, table;
	if(typeof year === 'number' && year > 0)
		date.setFullYear(year);
	if(typeof month === 'number' && month <= 12 && month > 0)
		date.setMonth(month-1);
	else
		date.setTime(this.getTime());

	last = this.lastDate(date.getFullYear(), date.getMonth()+1);
	console.log(o.format)
	o.format = o.format || 'Y/M/D';

	table = {
		year: date.getFullYear(),
		month: date.getMonth()+1,
		date: date.getDate(),
		today: null,
		items: [],
		prevItems: [],
		nextItems: []
	};

	date.setDate(1);
	beforeDays = date.getDay();
	date.setTime(date.getTime() - beforeDays * 86400000);
	startTime = date.getTime();
	afterDays = (beforeDays + last) % 7;
	afterDays = afterDays ? 7-afterDays : 0;
	total = beforeDays + last + afterDays;

	//mode: 0 或 默认，周日在首，周六在末
	//mode: 1，周一在首，周日在末
	if(o.mode === 1){
		//前月填充部分大于0时，整个列队前移1位后，起始时间戳加1天，前部减1天，尾部加1天，如果原本是6天，加1天之后为7天，刚好一行，删除它，total减7
		if(beforeDays){
			startTime += 86400000;
			beforeDays--;
			if(afterDays < 6)
				afterDays++;
			else{
				afterDays = 0;
				total -= 7;
			}
		}else{
			//前月填充为0时，整个列队前移1位后，前面需要六个填补，起始时间戳往前6天，尾部如果大于等于6，则减去6天，
			//前后抵销total不变，否则尾部加一天，加上前部添的6天，total加7天，其实就相当添了一行。
			startTime -= 6*86400000;
			beforeDays += 6;
			if(afterDays >= 6)
				afterDays -= 6;
			else{
				afterDays++;
				total += 7;
			}
		}
	}
	//limitRow: 默认false, 不保持7x6格布局
	//limitRow: true, 保持7x6格布局
	if(o.limitRow && total < 42){
		//如果天数只有四行，比如2月份有可能，则分别添加到前、后各一行
		if(42 - total >= 14){
			startTime -= 7 * 86400000;
			beforeDays += 7;
			afterDays += 7;
		}else{
			//比较前后部分填充的量，补一行在较少部分
			if(beforeDays < afterDays){
				startTime -= 7 * 86400000;
				beforeDays += 7;
			}else{
				afterDays += 7;
			}
		}
		total = 42;
	}

	for(; total--;)
		table.items.unshift(this.format(o.format, startTime+total*86400000));
	table.today = this.format(o.format, new Date().getTime());

	table.prevItems = table.items.splice(0, beforeDays);
	table.nextItems = table.items.splice(-afterDays, afterDays);
	return table;
}