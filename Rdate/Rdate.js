/**
 * 格式化时间
 * @param format {String} 格式字符串，ymdhisc几个字母，大写表示不满10（毫秒1000）时前位填充0。 字符任意组合与排序，中间也可以放任意符号。
      例如： 
      普通 = "Y/M/D H:I:S.C"，
      文艺 = "Y-M-D H:I:S.C"，
      二B = "i/d-h*y-m-Y" 或 "YYYYDDDDDDDmmm" 或 "Y-/#$@M***m H"....
   @param time {number} 时间戳，可选参数，如果不传入参数，则会输出当天日期
 */
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
/**
 * 获取某个月的最后一天的日期，这是为了方便获取当月的天数
 * @param year {number} 年，可选，不输入时默认当前年份
 * @param month {number} 月，可选，不输入时默认当前月份
 */
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
Date.prototype.weeks = ['日','一','二','三','四','五','六'];
/**
 * 获取某个月的日期，以数组形式返回
 * @param year {number,Object} 年份，如果输入为number时当作年份，但输入object时，则取当前年份和月份
 * @param month {number} 月份，如果第一个参数输入是object，此参数被忽略
 * @param o {Object} 可选参数，用于配置一些模式。格式如：
 *    {
	      mode: {number}  默认0，即周日在首，周六在末。 为1时，周一在首，周日在末
          format: {String} 规定输出的日期格式，默认"Y/M/D"
          limitRow: {boolean} 日期布局，默认false, 即不保持7x6格布局，例如2月份天数少，可能只有5行，即输出7x5天的日期。 为true时, 保持7x6格布局，如2月份如果不满6行，则会取前一个月或后一个月的天数来补齐整行
 *    }
 */
Date.prototype.dateTable = function (year, month, o) {
	var date = new Date(),
		today = date.getTime(),
		last,
		beforeDays,
		afterDays,
		startTime,
		total,
		table;
	if(typeof year === 'object')
		o = year;
	else if(typeof year === 'number' && year > 0 && typeof month === 'number' && month <= 12 && month > 0){
		date.setFullYear(year);
		date.setMonth(month-1);
	}else
		date.setTime(this.getTime());

	last = this.lastDate(date.getFullYear(), date.getMonth()+1);
	o.format = o.format || 'Y/M/D';

	table = {
		year: date.getFullYear(),
		month: date.getMonth()+1,
		date: date.getDate(),
		today: this.format(o.format, today),
		weeks: this.weeks.slice(0),
		dates: [],
		prevDates: [],
		nextDates: []
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
		table.weeks.splice(0, 1);
		table.weeks.push(this.weeks[0]);
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
		table.dates.unshift(this.format(o.format, startTime+total*86400000));

	table.prevDates = table.dates.splice(0, beforeDays);
	table.nextDates = table.dates.splice(-afterDays, afterDays);
	return table;
}
/**
 * 用于获取两个时间之间的日期，用于移动端竖向列表。比如滚动列表，不断加载新的日期会用到
 * @param start {number,String} 起始时间或向前天数。 比如基于第二个参数的时期向前取5天，则输入5即可
 * @param end {number,String} 终点时间或向后天数，同上。
 * @param format {String} 可选参数，规定时间格式。默认'Y/M/D'
 */
Date.prototype.dateBetween = function(start, end, format){
	var list = [];
	if(typeof start === 'string' && typeof end === 'string'){
		start = new Date(start).getTime();
		end = new Date(end).getTime()+86400000;
	}else if(typeof start === 'number' && typeof end === 'string'){
		end = new Date(end).getTime()+86400000;
		start = end - start*86400000;
	}else if(typeof start === 'string' && typeof end === 'number'){
		start = new Date(start).getTime();
		end = start + end*86400000;
	}else{
		return list;
	}
	for(; start < end; start += 86400000){
		list.push(this.format((format || 'Y/M/D'),start));
	}
	return list;
}