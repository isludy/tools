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
Date.prototype.dateTable = function (year, month, mode, format) {
	var date = new Date(), last, beforeDays, afterDays, startTime, total, table;
	if(typeof year === 'number' && year > 0)
		date.setFullYear(year);
	if(typeof month === 'number' && month <= 12 && month > 0)
		date.setMonth(month-1);
	else
		date.setTime(this.getTime());

	last = this.lastDate(date.getFullYear(), date.getMonth()+1);
	console.log(last)
	format = format || 'Y/M/D';
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

	if(mode === 1){
		if(beforeDays){
			startTime += 86400000;
			beforeDays--;
			afterDays++;
		}else{
			startTime -= 6*86400000;
			beforeDays += 6;
			if(afterDays >= 6)
				afterDays -= 6;
			else{
				afterDays++;
				total += 7;
			}
		}
	}else if(mode > 1 && total < 42){
		if(beforeDays){
			afterDays += 7;
		}else{
			startTime -= 7 * 86400000;
			beforeDays += 7;
		}
		total = 42;
	}

	for(; total--;)
		table.items.unshift(this.format(format, startTime+total*86400000));
	table.today = this.format(format, new Date().getTime());

	table.prevItems = table.items.splice(0, beforeDays);
	table.nextItems = table.items.splice(-afterDays, afterDays);
	return table;
}