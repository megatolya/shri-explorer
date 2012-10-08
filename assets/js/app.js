// TODO reserealize add
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
}
//пробелы в начале и в конце
function trim (str) { 
	return str.replace(/^\s+|\s+$/g, ""); 
}
//проверка на localStorage
function isLocalStorageAvailable() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}
//полный url в домен
//TODO: регулярка
function shortUrl(url){
	url = url.replace('http://','').replace('https://','').replace('ftp://','').replace('//','').replace('#','/').replace('?','/').split('/');
	return url[0];
}

function deleteItemFromArray(id,array){
	var newArr=new Array();
	for (var i = 0; i <= array.length - 1; i++) {
		if(i!=id)
			newArr.push(array[i]);
	}
	return newArr;
}

function Today(){
	return new Date (new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
}
function getDateOfText(text){
	//15.09.2012
	text = trim(text);
	var arr=text.split('.');
	var year = parseInt(arr[2]);
	if(arr[1][0]!='0')
		var month = parseInt(arr[1]);
	else
		var month = parseInt(arr[1][1]);
	var day = parseInt(arr[0]);
	var date = new Date(year,month-1,day);
	return date;
}

//компонент, отвечающий за данные
function shri(){
	this.version='alpha';
	this.schedule=undefined;
}
//lection={}
shri.prototype.addLectionToDay = function(lection,day) {
	var lecTime=parseInt(lection.time.replace(':',''));
	var schedule = this.schedule
	var dayArr=schedule[day];
	lection.date=schedule[day][0].date;
	dayArr.push(lection);
	var newArr=dayArr.sort(function(a,b){
		a=parseInt(a.time.replace(':',''));
		b=parseInt(b.time.replace(':',''));
		return a-b;
	});
	this.schedule[day]=newArr;
	localStorage.setItem('shri', JSON.stringify(this.schedule));
}
shri.prototype.deleteDay = function(id) {
	this.schedule = deleteItemFromArray(id,this.schedule);
	localStorage.setItem('shri', JSON.stringify(this.schedule));
};
shri.prototype.deleteLectionFromDay = function(day,lection) {
	console.log(this.schedule[day]);
	var dayArr=this.schedule[day];
	if(dayArr.length==1){
		this.schedule=deleteItemFromArray(day,this.schedule);
	}else{
		this.schedule[day]=deleteItemFromArray(lection,dayArr);
	}
	localStorage.setItem('shri', JSON.stringify(this.schedule));
	//TODO localstorage
	//TODO func localStorage.setItem('shri', JSON.stringify(this.schedule));
}
//TODO Break
shri.prototype.today = function() {
	var today = Today().valueOf();
	var schedule = this.schedule;
	for (var i = schedule.length - 1; i >= 0; i--) {
		var day=schedule[i]
		for (var j = day.length - 1; j >= 0; j--) {
			if(getDateOfText(day[j].date).valueOf()==today){
				
				return i;
			}
		}
	}
	return false;
}
//из формата shri в формат json
shri.prototype.import = function(text) {
	var arr=text.split('##');
	var countDays=0;
	var schedule=new Array(1);
	for (var i = 0; i <= arr.length - 1; i++) {
		schedule[i]=new Array();
		var arr2=arr[i].split('\n');
		var countStr=0;
		var countLection=0;
		var countIdea=0;
		schedule[i][countLection]=new Object();
		for (var j = 0; j <= arr2.length - 1; j++) {
			var currentStr=trim(arr2[j]);
			if(currentStr!='') {
				//date
				if(countStr==0){
					schedule[i][countLection].date=currentStr;
				}
				//time
				if(countStr==1){
					schedule[i][countLection].time=currentStr;
				}
				//theme
				if(countStr==2){
					schedule[i][countLection].theme=currentStr;
				}
				//lector
				if(countStr==3){
					schedule[i][countLection].lector=new Object();
					var split = currentStr.split('(');
					var linksStr=split[1];	
					linksStr=trim(linksStr.replace(')','').replace(' ',''));
					schedule[i][countLection].lector.name=trim(split[0]);
					schedule[i][countLection].lector.links=linksStr.split(',');
				}
				//idea
				if(countStr>3){
					if(trim(arr2[j]).indexOf('?:')+1){
							if(schedule[i][countLection].idea==undefined)
								schedule[i][countLection].idea=new Array();
							currentStr=trim(currentStr.replace('?:',''));
							schedule[i][countLection].idea[countIdea]=currentStr;
							countIdea++;
						}
				//presentation link
					else{
						schedule[i][countLection].link=currentStr;
						if(schedule[i][countLection].date==undefined)
							schedule[i][countLection].date=schedule[i][countLection-1].date;
						countLection++;
						countIdea=0;
						countStr=0;
						schedule[i][countLection]=new Object();
					}
				}
				countStr++;
			}

		}	
		if(schedule[i][countLection].time==undefined)
				schedule[i].splice(countLection,1)
	}
	this.schedule=schedule;
	localStorage.setItem('shri', JSON.stringify(schedule));
}
//TODO поменять все парентс на data-id, data-id поменять на data-day
shri.prototype.buildSchedule=function(){
	var schedule=this.schedule;
	var html = new String();
	for (var i = 0; i <= schedule.length - 1; i++) {
		html+='<div class="b-day" data-day="'+i+'"><img class="b-day__edit" src="assets/img/pencil.png"><div class="b-day__date">'+schedule[i][0].date+'</div>';
		for (var j = 0; j <= schedule[i].length - 1; j++) {
			html+='<div class="b-lesson"><div data-day="'+i+'" data-lection="'+j+'" class="b-lesson__time">'+schedule[i][j].time+
			'</div><div class="b-lesson__name">'+schedule[i][j].theme+' - <i>'+schedule[i][j].lector.name+'</i></div></div>';
		}
		html+='<a href="#" class="b-button b-lesson__link" data-id="'+i+'">Посмотреть</a></div>';
	}
	$('.b-schedule').html(html);
	$('.b-lesson__time').draggable({
		revert: "invalid"
		
	});
	
	$('.b-day').droppable({
			accept: ".b-lesson__time",
			activeClass: "mega-test",
			drop: function( event, ui ) {
				var date = $(this).find('.b-day__date').html();
				if(date!=shri.schedule[$(ui.draggable).data('day')][0].date){
						if(shri.changeLectionDay($(ui.draggable).data('day'),$(ui.draggable).data('lection'),date)){
							shri.buildSchedule();
						}
					}else{
						$(ui.draggable).css('left','auto').css('top','auto');
					}
			}
	});
	
	
}
shri.prototype.getDayByDate = function(date) {
	var schedule = this.schedule;
	for (var i = schedule.length - 1; i >= 0; i--) {
		if(schedule[i][0].date==date)
			return i;	
	}
	return false;
}
shri.prototype.changeLectionDay = function(day,lection,date) {
	var schedule = this.schedule;
	//если переносят в тот же день
	if(schedule[day][lection].date==date)
		return false;
	//ищем существующий день
	for (var i = 0; i <= schedule.length - 1; i++) {

		for (var j = 0; j <= schedule[i].length - 1; j++) {
			if(schedule[i][j].date==date){
				shri.addLectionToDay(schedule[day][lection],i);
				shri.deleteLectionFromDay(day,lection);
				return true;
			}
		};
	};
	//не нашли
	this.schedule.push([schedule[day][lection]]);
	this.schedule[this.schedule.length-1][0].date=date;
	this.deleteLectionFromDay(day,lection);
	this.schedule.sort(function(a,b){
		a=getDateOfText(a[0].date); 
		b=getDateOfText(b[0].date);
		
		return parseInt(a.valueOf())-parseInt(b.valueOf());
	});
	
	localStorage.setItem('shri',JSON.stringify(this.schedule));
	return true;

};
shri.prototype.reserialize = function(obj) {
	obj.lector=new Object;
	obj.lector.name=obj['lector.name'];
	obj.lector.links=obj['lector.links'];
	if(typeof(obj.lector.links)=='string')
		obj.lector.links=new Array(obj.lector.links);
	if(typeof(obj.idea)=='string')
		obj.idea=new Array(obj.idea);
	delete obj['lector.links'];
	delete obj['lector.name'];
	return obj;
}
shri.prototype.saveDay = function(id,arr) {
	if(arr.length>0){
		this.schedule[id]=arr;
		localStorage.setItem('shri',JSON.stringify(this.schedule));
	}else{
		this.deleteDay(id);
	}
	shri.buildSchedule();
}

shri.prototype.ini = function() {

	var schedule = localStorage.getItem('shri');
	if(schedule!='' && schedule!=undefined && schedule!='[[]]' && schedule!='[]'){
		this.schedule=$.parseJSON(schedule);
		if(!this.today()){
			$('.b-toolbar__link_name_today').removeClass('b-toolbar__link_name_today').addClass('b-link-disabled')
		}
		this.buildSchedule(schedule);
	}else{
		$('.b-schedule').html('<div class="b-day"><h1 class="b-hello-header">Добро пожаловать :-)</h1><p class="b-hello-text">Загляните в справку или загрузите ваше расписание.</p></div>');
	}

};		
			
//из json в .shri			
shri.prototype.export = function() {
	var schedule=this.schedule;
	var res=new String();
	for (var i = 0; i <= schedule.length - 1; i++) {
		if(i!=0)res+= '#\n';
		for (var j = 0; j <= schedule[i].length - 1; j++) {
			res+=schedule[i][j].date+ '\n';
		};
	};
	return res;
};
shri= new shri();

//компонент, отвечающий за интерфейс
function interface(){
	this.dialogVisible=false;
	this.datepickerOpened=false;
	this.datepickerOpenedByDrag=false;
}
interface.prototype.openDialog = function(header,html,footer) {
	this.dialogVisible=true;
	$('.b-dialog-win__content').html(html);
	$('.b-dialog-win__header').html(header);
	$('.b-dialog-win__footer').html((footer==undefined?'':footer));
	$('.b-bg-shadow').show();
	$('.b-dialog-win').show();
	$('body').css('overflow','hidden');
}
interface.prototype.dialogPos = function() {
	var winWidth = $(window).width();
	var dialogWidth = $('.b-dialog-win').width();
	$('.b-dialog-win').css('left',(winWidth-dialogWidth)/2);
	$('.b-dialog-win__content').css('max-height',$(window).height()-220+'px');
}
interface.prototype.closeDialog = function() {
	$('body').css('overflow','auto');
	$('.b-bg-shadow').hide();
	$('.b-dialog-win').hide();
	this.dialogVisible=false;
}
interface.prototype.showDay = function(id) {
	//TODO: currentDay
	var day = shri.schedule[id];
	var html = new String();
	for (var i = 0; i <= day.length - 1; i++) {
		html+='<div class="b-day-lesson"><div class="b-day-lesson__time">'+day[i].time+
		'</div><h1 class="b-day-lesson__theme">'+day[i].theme+'</h1><div class="b-lector">Лектор: '+day[i].lector.name+
		' (';
			var lectorLinks=day[i].lector.links.length-1;
			for (var j = 0; j <= lectorLinks; j++) {
				html+='<a href="'+day[i].lector.links[j]+'" class="b-lector__link">'+shortUrl(day[i].lector.links[j])+'</a>'+(lectorLinks==j ? '':', ');
			}
			html+=')</div><div class="b-headnotes"><h4 class="b-headnotes__header">Тезисы:</h4>';
			for (var j = 0; j <= day[i].idea.length - 1; j++) {
				html+='<div class="b-headnote">'+day[i].idea[j]+'</div>';
			}
			html+='</div><a href="'+day[i].link+'" target="_blank" class="b-button b-day-lesson__keynote">Презентация</a>';
			html+='</div>';
	}
	html+='<div class="b-dialog-win__nav"><a onclick="return false;" class="b-dialog-win__nav_target_prev" href="'+(id-1)+'">←</a>  Ctrl  '+
		   '<a class="b-dialog-win__nav_target_next" href="'+(parseInt(id)+1)+'">→</a> <a class="b-dialog-win__nav_target_edit" href="'+(parseInt(id))+'">Изменить</a></div>';
	interface.openDialog(day[0].date,html);

}
interface.prototype.datepickerToggle = function(time) {
	if(time==undefined)
		time=0;
	if(this.datepickerOpened){
		this.datepickerClose(time);
	}else{
		this.datepickerOpen(time);
	}
}
interface.prototype.datepickerClose = function (time) {
	if(time==undefined)
		time=0;
	$('.b-datepicker-toggle').animate({
			left:'-315px'
		},time,function(){
			$('.b-datepicker-toggle__nav-button').attr('src','assets/img/right_arrow.png');
			interface.datepickerOpened=false;
		});
}
interface.prototype.datepickerOpen = function (time) {
	if(time==undefined)
		time=0;
	$('.b-datepicker-toggle').animate({
			left:0
		},time,function(){
			$('.b-datepicker-toggle__nav-button').attr('src','assets/img/left_arrow.png');
			interface.datepickerOpened=true;
		});
}
interface.prototype.droppableDatepicker = function() {
	setTimeout(function(){
		$('.ui-state-default').droppable({
			accept: ".b-lesson__time",
			activeClass: "mega-test",
			drop: function( event, ui ) {
				var month =$(this).parent().data('month')+1;
				if (month <10 )
					month = '0'+month;
				var date = $(this).html()+'.'+month+'.'+$(this).parent().data('year');
					if(shri.changeLectionDay($(ui.draggable).data('day'),$(ui.draggable).data('lection'),date)){
						shri.buildSchedule();
					}else{
						$(ui.draggable).css('left','auto').css('top','auto');
					}
			}
		});
	},100);
	
};
interface.prototype.editDay = function(id) {
	//TODO: currentDay
	var day = shri.schedule[id];
	var html = new String();
	var date = day[0].date;
	for (var i = 0; i <= day.length - 1; i++) {
		html+='<form class="b-edit-lesson" data-id="'+i+'">'+
				'<input type="hidden" name="date" value="'+date+'">'+
				'<table class="i-edit-lesson">'+
				
				'<tr><td>Время</td><td><input class="b-edit-lesson__input b-edit-lesson__input_name_time" name="time" value="'+day[i].time+'"></td></tr>'+
				'<tr><td colspan="3">Тема</td></tr>'+
				'<tr><td colspan="3"><input class="b-edit-lesson__input" name="theme" value="'+day[i].theme+'"></td></tr>'+
				'<tr><td colspan="3">Тезисы <a href="#" class="b-edit-lesson__add-idea">+</a></td></tr>';

		for (var j = 0; j <= day[i].idea.length - 1; j++) {
			html+='<tr><td colspan="2"><input class="b-edit-lesson__input" name="idea" value="'+day[i].idea[j]+'"></td><td><a href="#" class="b-edit-lesson__delete-idea">x</a></td></tr>';
		}
		html+='<tr><td colspan="3">Лектор</td></tr>'+
			  '<tr><td colspan="3"><input class="b-edit-lesson__input" name="lector.name" value="'+day[i].lector.name+'"></td></tr>'+
			  '<tr><td colspan="3">Ссылки на лектора <a href="#" class="b-edit-lesson__add-link">+</a></td></tr>';
		for (var j = 0; j <= day[i].lector.links.length - 1; j++) {
			html+='<tr><td colspan="2"><input class="b-edit-lesson__input" name="lector.links" value="'+day[i].lector.links[j]+'"></td><td><a href="#" class="b-edit-lesson__delete-link">x</a></td></tr>';
		};
		html+='<tr><td colspan="3">Презентация</td></tr>'+
			  '<tr><td colspan="3"><input class="b-edit-lesson__input" name="link" value="'+day[i].link+'"></td></tr>'+
		      '</table></form>';
	}
	var footer='<a href="#" class="b-save-day" data-id="'+id+'">Сохранить</a> '+
				'<a href="#" class="b-lesson__link" data-id="'+id+'">Показать день</a> '+
				'<a href="#" class="b-save-day-quit">Выйти</a>';
	this.openDialog(date,html,footer);

}
interface=new interface();

$(function(){	
	$.datepicker.setDefaults($.datepicker.regional['ru']);
  	$('.b-datepicker').datepicker({
  		onChangeMonthYear: interface.droppableDatepicker
  	});
  	interface.droppableDatepicker();
	$('.b-lesson__time').live('mousedown',function(){
		if(interface.datepickerOpened)
			interface.datepickerOpenedByDrag=false;
		else
			interface.datepickerOpenedByDrag=true;
		interface.datepickerOpen(200);
	});
	$(document).mouseup(function(){
		if(interface.datepickerOpenedByDrag)
		setTimeout(function(){
			interface.datepickerClose(200);
			interface.datepickerOpenedByDrag=false;
		},500);
	});
	$('.b-datepicker-toggle__nav-button').click(function(){
		interface.datepickerToggle(200);
	});
	shri.ini();
	interface.dialogPos();
	$('.b-day__edit').live('click',function(){
		interface.editDay($(this).parent().data('day'));
		return false;
	});
	$('.b-link-disabled').click(function(){
		return false;
	});
	$('.b-toolbar__link_name_today').click(function(){
		interface.showDay(shri.today());
		return false;
	});

	$('.b-toolbar__link_name_import').click(function(){
		var html = '<p>Вставьте содержимое файла .shri и нажмите импорт.</p><textarea class="b-import-textarea"></textarea><button class="b-button b-import-btn">Импорт</button>';
		interface.openDialog('Импорт',html);	
		return false;
	});

	$('.b-bg-shadow').click(function(){
		interface.closeDialog();
		return false;
	});
	$('.b-dialog-win__close-btn').click(function(){
		interface.closeDialog();
		return false;
	});
	$('.b-toolbar__link_name_export').click(function(){
		var html = '<p>Скопируйте содержимое формы в файл .shri. </p><textarea class="b-export-textarea"></textarea>';

		interface.openDialog('Экспорт',html);
		$('.b-export-textarea').val(shri.export()).select();
		return false;
	});
	$('.b-toolbar__link_name_manual').click(function(){
		var html = '<p>Здесь будет справка</p>';
		interface.openDialog('Справочная',html);
		return false;
	});
	$('.b-import-btn').live('click',function(){
		var text=$('.b-import-textarea').val();
		shri.import(text);
		shri.buildSchedule();
		interface.closeDialog();
		return false;
	});

	$('.b-save-day-quit').live('click',function(){
		interface.closeDialog();
		return false;
	});
	$('.b-lesson__link').live('click',function(){
		var id = $(this).data('id');
		interface.showDay(id);
		return false;
	});
	$('.b-dialog-win__nav_target_prev').live('click',function(){
		var id = $(this).attr('href');
		if(id>=0 && id<=shri.schedule.length)
			interface.showDay(id);
		return false;
	});
	$('.b-dialog-win__nav_target_next').live('click',function(){
		var id = $(this).attr('href');
		if(id>=0 && id<shri.schedule.length)
			interface.showDay(id);
		return false;
	});

	$('.b-dialog-win__nav_target_edit').live('click',function(){
		var id = $(this).attr('href');
			interface.editDay(id);
		return false;
	});
	$('.ui-state-default').click(function(){
		$this=$(this);
		var date=$this.html()+'.'+($this.parent().data('month')+1)+'.'+$this.parent().data('year');
		var id=shri.getDayByDate(date);
		if(id)
			interface.showDay(id);
		return false;
	});
	$('.b-export-textarea').live('click',function(){
		$(this).select();
		return false;
	});

	$('.b-save-day').live('click',function(){
		var arr=new Array();
		var day =$(this).data('id');
		$('.b-edit-lesson').each(function(k,form){
			var dataModel=shri.reserialize($(form).serializeObject());
				arr.push(dataModel);	
			
		});
		shri.saveDay(day,arr);
	});

	$('.b-edit-lesson__delete-idea').live('click',function(){
		var $this=$(this);
		if($this.parents('.i-edit-lesson').find('.b-edit-lesson__delete-idea').length>1)
			$this.parents('tr').remove();
	});
	$('.b-edit-lesson__delete-link').live('click',function(){
		var $this=$(this);
		if($this.parents('.i-edit-lesson').find('.b-edit-lesson__delete-link').length>1)
			$this.parents('tr').remove();
	});
	$('.b-edit-lesson__add-idea').live('click',function(){
		$(this).parents('tr').after('<tr><td colspan="2"><input class="b-edit-lesson__input" name="idea"></td><td><a href="#" class="b-edit-lesson__delete-idea">x</a></td></tr>');
		return false;
	});
	$('.b-edit-lesson__add-link').live('click',function(){
		$(this).parents('tr').after('<tr><td colspan="2"><input class="b-edit-lesson__input" name="lector.links"></td><td><a href="#" class="b-edit-lesson__delete-link">x</a></td></tr>');
		return false;
	});

	shortcut.add("Ctrl+left",function() {
		if(interface.dialogVisible)
			$('.b-dialog-win__nav_target_prev').click();
	});

	shortcut.add("Ctrl+right",function() {
		if(interface.dialogVisible)
			$('.b-dialog-win__nav_target_next').click();
	});

	

});
$(window).resize(function(){
	interface.dialogPos();
});
/* TODO function today rename*/

