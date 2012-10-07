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


function Today(){
	return new Date (new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
}
function date(text){
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
//TODO Break
shri.prototype.today = function() {
	var today = Today().valueOf();
	var schedule = this.schedule;
	for (var i = schedule.length - 1; i >= 0; i--) {
		var day=schedule[i]
		for (var j = day.length - 1; j >= 0; j--) {
			if(date(day[j].date).valueOf()==today){
				
				return i;
			}
		}
	}
	return false;
}
//из формата shri в формат json
shri.prototype.import = function(text) {
	console.log('import');
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
	console.log('import done');
}

shri.prototype.buildSchedule=function(){
	console.log('building schedule');
	var schedule=this.schedule;
	var html = new String();
	for (var i = 0; i <= schedule.length - 1; i++) {
		html+='<div class="b-day" data-day="'+i+'"><img class="b-day__edit" src="assets/img/pencil.png"><div class="b-day__date">'+schedule[i][0].date+'</div>';
		for (var j = 0; j <= schedule[i].length - 1; j++) {
			html+='<div class="b-lesson"><div class="b-lesson__time">'+schedule[i][j].time+
			'</div><div class="b-lesson__name">'+schedule[i][j].theme+' - <i>'+schedule[i][j].lector.name+'</i></div></div>';
		}
		html+='<a href="#" class="b-button b-lesson__link" data-id="'+i+'">Посмотреть</a></div>';
	}
	$('.b-schedule').html(html);
	$('.b-lesson__name').draggable({
		revert: "invalid"
	});
	$('.ui-state-default').droppable({
			accept: ".b-lesson__name",
			activeClass: "mega-test",
			drop: function( event, ui ) {
				console.log(ui);
				console.log(ui.draggable);
				console.log(event);
				alert($(this).html());
			}
	});
	
	console.log('building schedule done');
}
shri.prototype.reserialize = function(obj) {
	obj.lector=new Object;
	obj.lector.name=obj['lector.name'];
	obj.lector.links=obj['lector.links'];
	if(typeof(obj.lector.links)=='string')
		obj.lector.links=new Array(obj.lector.links);
	delete obj['lector.links'];
	delete obj['lector.name'];
	return obj;
}
shri.prototype.saveDay = function(id,arr) {
	this.schedule[id]=arr;
	localStorage.setItem('shri',JSON.stringify(this.schedule));
	shri.buildSchedule();
}

shri.prototype.ini = function() {

	var schedule = localStorage.getItem('shri');
	if(schedule!='' && schedule!=undefined && schedule!='[[]]'){
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
	console.log('export');
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
interface.prototype.editDay = function(id) {
	//TODO: currentDay
	var day = shri.schedule[id];
	var html = new String();
	var date = day[0].date;
	for (var i = 0; i <= day.length - 1; i++) {
		html+='<form class="b-edit-lesson" data-id="'+i+'"><table class="i-edit-lesson">'+
				'<tr><td width="10%">Дата</td><td colspan="2" width="80%"><input class="b-edit-lesson__input" name="date" value="'+date+'"></td></tr>'+
				'<tr><td>Время</td><td><input class="b-edit-lesson__input" name="time" value="'+day[i].time+'"></td></tr>'+
				'<tr><td colspan="3">Тема</td></tr>'+
				'<tr><td colspan="3"><input class="b-edit-lesson__input" name="theme" value="'+day[i].theme+'"></td></tr>'+
				'<tr><td colspan="3">Тезисы</td></tr>';

		for (var j = 0; j <= day[i].idea.length - 1; j++) {
			html+='<tr><td colspan="2"><input class="b-edit-lesson__input" name="idea" value="'+day[i].idea[j]+'"></td><td><a href="#" class="b-edit-lesson__delete-idea">x</a></td></tr>';
		}
		html+='<tr><td colspan="3">Лектор</td></tr>'+
			  '<tr><td colspan="3"><input class="b-edit-lesson__input" name="lector.name" value="'+day[i].lector.name+'"></td></tr>'+
			  '<tr><td colspan="3">Ссылки на лектора</td></tr>';
		for (var j = 0; j <= day[i].lector.links.length - 1; j++) {
			html+='<tr><td colspan="2"><input class="b-edit-lesson__input" name="lector.links" value="'+day[i].lector.links[j]+'"></td><td><a href="#" class="b-edit-lesson__delete-link">x</a></td></tr>';
		};
		html+='<tr><td colspan="3">Презентация</td></tr>'+
			  '<tr><td colspan="3"><input class="b-edit-lesson__input" name="link" value="'+day[i].link+'"></td></tr>'+
		      '</table></form>';
	}
	var footer='<a href="#" class="b-save-day" data-id="'+id+'">Сохранить и выйти</a> '+
				'<a href="#" class="b-lesson__link" data-id="'+id+'">Показать день</a> '+
				'<a href="#" class="b-save-day-quit">Выйти</a>';
	this.openDialog(date,html,footer);

}
interface=new interface();

$(function(){	
	$('.b-datepicker').datepicker();;
	
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
		if(id>=0 && id<=shri.schedule.length){
			interface.showDay(id);
		}
		return false;
	});
	$('.b-dialog-win__nav_target_next').live('click',function(){
		var id = $(this).attr('href');
		if(id>=0 && id<shri.schedule.length){
			interface.showDay(id);
		}
		return false;
	});

	$('.b-dialog-win__nav_target_edit').live('click',function(){
		var id = $(this).attr('href');
			interface.editDay(id);
		return false;
	});

	$('.b-export-textarea').live('click',function(){
		$(this).select();
		return false;
	});

	$('.b-save-day').live('click',function(){
		var arr=[];
		$('.b-edit-lesson').each(function(k,form){
			arr.push(shri.reserialize($(form).serializeObject()));
		});
		shri.saveDay($(this).data('id'),arr);
	});

	$('.b-edit-lesson__delete-idea').live('click',function(){
		var $this=$(this);
		if($this.parents('.i-edit-lesson').find('.b-edit-lesson__delete-idea').length>1)
			$this.parents('tr').remove();
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