function trim (str) { 
	return str.replace(/^\s+|\s+$/g, ""); 
}
function isLocalStorageAvailable() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function shri(){
	this.version='alpha';
	this.schedule=undefined;
}

shri.prototype.import = function(text) {
	console.log('import');
	var arr=text.split('#');
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
				if(countStr==0){
					schedule[i][countLection].date=currentStr;
				}
				if(countStr==1){
					schedule[i][countLection].time=currentStr;
				}
				if(countStr==2){
					schedule[i][countLection].theme=currentStr;
				}
				if(countStr==3){
					schedule[i][countLection].lector=currentStr;
				}
				if(countStr>3){
					if(trim(arr2[j]).indexOf('?:')+1){
							if(schedule[i][countLection].idea==undefined)
								schedule[i][countLection].idea=new Array();
							schedule[i][countLection].idea[countIdea]=currentStr;
							countIdea++;
						}
					else{
						schedule[i][countLection].link=currentStr;
						if(schedule[i][countLection].date==undefined)
							schedule[i][countLection].date=schedule[i][countLection-1].date;
						countLection++;
						countIdea=0;
						countStr=0;
						console.log(j);
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

shri.prototype.build=function(){
	var schedule=this.schedule;
	var html = new String();
	for (var i = 0; i <= schedule.length - 1; i++) {
		html+='<div class="b-day"><div class="b-day__date">'+schedule[i][0].date+'</div>';
		for (var j = 0; j <= schedule[i].length - 1; j++) {
			html+='<div class="b-lesson"><div class="b-lesson__time">'+schedule[i][j].time+
			'</div><div class="b-lesson__name">'+schedule[i][j].theme+'</div></div>';
		}
		html+='</div>';
	}
	$('.b-schedule').html(html);
	console.log(schedule);
}

				
shri.prototype.ini = function() {
	var schedule = localStorage.getItem('shri');
	if(schedule){
		this.import(schedule);
	}else{
		alert('no');
	}
};		
			
			
shri.prototype.export = function(selector) {
	console.log('export');
	var schedule=localStorage.getItem('shri');
	schedule=$.parseJSON(schedule);
	var res=new String();
	for (var i = 0; i <= schedule.length - 1; i++) {
		if(i!=0)res+= '#\n';
		for (var j = 0; j <= schedule[i].length - 1; j++) {
			res+=schedule[i][j].date+ '\n';
		};
	};
	return res;
};
/*localStorage.setItem('foo', JSON.stringify(foo));
var fooFromLS = JSON.parse(localStorage.getItem('foo'));
console.log(fooFromLS);*/
shri= new shri();
function interface(){
	this.dialogVisible=false;
}
interface.prototype.openDialog = function(header,html) {
	this.dialogVisible=true;
	$('.b-dialog-win__content').html(html);
	$('.b-dialog-win__header').html(header);
	$('.b-bg-shadow').show();
	$('.b-dialog-win').show();
	$('body').css('overflow','hidden');
}
interface.prototype.dialogPos = function() {
	var winWidth = $(window).width();
	var dialogWidth = $('.b-dialog-win').width();
	$('.b-dialog-win').css('left',(winWidth-dialogWidth)/2)
}
interface.prototype.closeDialog = function() {
	$('body').css('overflow','auto');
	$('.b-bg-shadow').hide();
	$('.b-dialog-win').hide();
	this.dialogVisible=false;
}
interface=new interface();
$(function(){
	shri.ini();
	interface.dialogPos();
	$('.b-toolbar__link_name_import').click(function(){
		var html = '<p>Вставьте содержимое файла .shri и нажмите импорт.</p><textarea class="b-import-textarea"></textarea><button class="b-button b-import-btn">Импорт</button>';
		interface.openDialog('Импорт',html);	
	});

	$('.b-bg-shadow').click(function(){
		interface.closeDialog();
	});
	$('.b-dialog-win__close-btn').click(function(){
		interface.closeDialog();
	});
	$('.b-toolbar__link_name_export').click(function(){
		var html = '<p>Скопируйте содержимое формы в файл .shri. </p><textarea class="b-export-textarea"></textarea><button class="b-button b-export-copy">Скопировать в буфер</button>';
		interface.openDialog('Экспорт',html);
	});
	$('.b-toolbar__link_name_manual').click(function(){
		var html = '<p>Здесь будет справка</p>';
		interface.openDialog('Справочная',html);
	});
	$('.b-import-btn').live('click',function(){
		var text=$('.b-import-textarea').val();
		shri.import(text);
		shri.build();
	});
});
$(window).resize(function(){
	interface.dialogPos();
});