window.Chart = new( function()
{
	var __module__ = 
	{
		'helpers/color.js': 
		{
			randomColor: function( id )
			{
				var colors = [ 'F44336', '3F51B5', '009688', '8E24AA', 'FFEB3B' ];
		
				if( id < colors.length ){ return '#' + colors[id]; }
		
				var color = '#';
				for( var i = 0; i < 6; ++i )
				{
					color += '0123456789ABCDEF'.charAt(Math.floor(Math.random()*16));
				}
		
				return color;
			}
		},

		'datasets/radial.js': function( data, on_update, options )
		{
			var self = this;
		
			this.values = null;
			this.colors = null;
			this.sum = 0;
		
			this.updateData = function( data )
			{
				self.values = {};
				self.colors = self.colors ? self.colors : {};
				self.sum = 0;
		
				var i = 0;
				for( var segment in data )
				{
					self.values[segment] = data[segment];
					self.sum += data[segment];
		
					if( typeof self.colors[segment] == 'undefined' )
					{
						self.colors[segment] = __module__['helpers/color.js'].randomColor(i++);
					}
				}
		
				window.requestAnimationFrame( on_update );
		
				/*setTimeout(function()
				{
					var data = {};
		
					for( var segment in self.values )
					{
						data[segment] = self.values[segment] * ( 0.95 + Math.random() * 0.1 );
					}
		
					self.updateData( data );
		
				}, 60);*/
			}
		
			self.updateData( data );
		},

		'charts/pie.js': function( canvas, data, options )
		{
			var pixelRatio = window.devicePixelRatio,
				context = canvas.getContext('2d'),
				chart = { event: { hover: null } };
		
			var defaults =
			{
				innerRadiusRatio: 2 / 3,
				segmentSpacing: 2
			};
		
			function render()
			{
				chart.width = canvas.width;
				chart.height = canvas.height;
				chart.center = { x: chart.width / 2, y: chart.height / 2 };
				chart.radius = Math.min( chart.width, chart.height ) / 2;
				chart.innerRadius = options.innerRadiusRatio * chart.radius;
		
				context.clearRect(0, 0, chart.width, chart.height);
		
				var fraction = 0;
		
				for( var segment in chart.dataset.values )
				{
					var startAngle = (( 360 * fraction - 90) * Math.PI ) / 180,
						endAngle = startAngle + 2 * chart.dataset.values[segment] / chart.dataset.sum * Math.PI,
		
						outerSpacing = pixelRatio * ( options.segmentSpacing != 0 ? options.segmentSpacing : -0.5 ) / ( 2 * chart.radius );
						innerSpacing = pixelRatio * ( options.segmentSpacing != 0 ? options.segmentSpacing : -0.5 ) / ( 2 * chart.innerRadius );
		
				    context.beginPath();
				    {
					    if( chart.innerRadius != 0 )
					    {
						    context.arc(chart.center.x, chart.center.y, chart.innerRadius, endAngle - innerSpacing, startAngle + innerSpacing, true);
						}
						else{ context.moveTo(chart.center.x, chart.center.y); } // Todo: posunut stred 0.5px v proti smere segmentu nech nevidno biele medzery medzi segmentami
		
					    context.arc(chart.center.x, chart.center.y, chart.radius, startAngle + outerSpacing, endAngle - outerSpacing, false);
				    }
				    context.closePath();
		
					context.fillStyle = chart.dataset.colors[segment];
					context.fill();
		
					if( chart.event.hover == segment )
					{
						context.beginPath();
					    {
						    if( chart.innerRadius != 0 )
						    {
							    context.arc(chart.center.x, chart.center.y, chart.innerRadius, endAngle - innerSpacing, startAngle + innerSpacing, true);
							}
							else{ context.moveTo(chart.center.x, chart.center.y); }
		
						    context.arc(chart.center.x, chart.center.y, chart.radius, startAngle + outerSpacing, endAngle - outerSpacing, false);
					    }
					    context.closePath();
					    context.fillStyle = 'rgba(0,0,0,0.1)';
						context.fill();
					}
		
					if( options['3d'] ) // 3D
					{
						context.beginPath();
					    {
						    if( chart.innerRadius != 0 )
						    {
							    context.arc(chart.center.x, chart.center.y, chart.innerRadius, endAngle - innerSpacing, startAngle + innerSpacing, true);
							}
							else{ context.moveTo(chart.center.x, chart.center.y); }
		
						    context.arc(chart.center.x, chart.center.y, chart.radius, startAngle + outerSpacing, endAngle - outerSpacing, false);
					    }
					    context.closePath();
					    var gradient = context.createRadialGradient(chart.center.x, chart.center.y, chart.innerRadius, chart.center.x, chart.center.y, chart.radius);
					    if( chart.innerRadius != 0 )
					    {
							gradient.addColorStop(0,'rgba(0,0,0,'+(0.1+(1-options.innerRadiusRatio)/10)+')');
							gradient.addColorStop(0.5,'rgba(255,255,255,'+(0.1+(1-options.innerRadiusRatio)/10)+')');
						}
						else
						{
							gradient.addColorStop(0,'rgba(255,255,255,'+(0.1+(1-options.innerRadiusRatio)/10)+')');
						}
						gradient.addColorStop(1,'rgba(0,0,0,'+(0.1+(1-options.innerRadiusRatio)/10)+')');
						context.fillStyle=gradient;
						context.fill();
					}
		
					var font_size = chart.radius / 15;
		
					context.font = font_size + 'px Arial, Helvetica';
					context.textAlign = 'center';
					context.fillStyle = 'white';
		
					var label = Math.round(chart.dataset.values[segment] / chart.dataset.sum * 1000)/10+'%';
		
					if( context.measureText(label).width < chart.radius - chart.innerRadius )
					{
						context.fillText(label, chart.center.x + Math.cos( ( 2 * fraction + chart.dataset.values[segment] / chart.dataset.sum - 0.5 ) * Math.PI ) * (chart.radius + chart.innerRadius) / 2, chart.center.y + font_size / 3 + Math.sin( ( 2 * fraction + chart.dataset.values[segment] / chart.dataset.sum - 0.5 ) * Math.PI ) * (chart.radius + chart.innerRadius) / 2);
					}
		
					fraction += chart.dataset.values[segment] / chart.dataset.sum;
				}
		
				var font_size = chart.radius / 10;
		
				context.font = font_size + 'px Arial, Helvetica';
				context.textAlign = 'center';
				context.fillStyle = 'black';
				context.fillText( chart.event.hover ? chart.event.hover : 'Graf' , chart.center.x, chart.center.y);
			}
		
			this.event =  function( event, position )
			{
				if( event == 'mousemove' )
				{
					var hover = null,
						distanceFromCenter = Math.sqrt(Math.pow(position.x - chart.center.x,2) + Math.pow(position.y - chart.center.y,2));
		
					if( distanceFromCenter < chart.radius && distanceFromCenter > chart.innerRadius )
					{
						var event_fraction = 1 - (Math.atan2(position.x - chart.center.x, position.y - chart.center.y) * (180 / Math.PI) - 180 + 720) % 360 / 360,
							fraction = 0;
		
						for( var segment in chart.dataset.values )
						{
							if( event_fraction <= ( fraction += chart.dataset.values[segment] ) / chart.dataset.sum )
							{
								hover = segment; break;
							}
						}
					}
		
					if( chart.event.hover != hover )
					{
						chart.event.hover = hover;
						render();
					}
				}
				else if( event == 'mouseout' )
				{
					if( chart.event.hover )
					{
						chart.event.hover = null;
						render();
					}
				}
				else if( event == 'resize' )
				{
					render();
				}
			}
		
			this.updateData = function( data )
			{
				chart.dataset.updateData( data );
			}
		
			chart.dataset = new __module__['datasets/radial.js']( data, render );
		}
	}
var pixelRatio = window.devicePixelRatio;
	
	var charts = [];
	
	var chart_types = 
	{
		pie: __module__['charts/pie.js']
	}
	
	function viewportPosition( element )
	{
		var bounds = element.getBoundingClientRect();
		
		return { x : bounds.left, y : bounds.top };
	}
		
	window[window.attachEvent ? 'attachEvent' : 'addEventListener'](window.attachEvent ? 'onresize' : 'resize', function()
    {
		for( var i = charts.length - 1; i >= 0; --i )
		{
			if( document.contains(charts[i].element) && document.contains(charts[i].canvas) )
			{
				if( charts[i].width != charts[i].element.offsetWidth || charts[i].height != charts[i].element.offsetHeight )
				{
					charts[i].canvas.setAttribute('width', charts[i].element.offsetWidth * pixelRatio);
					charts[i].canvas.setAttribute('height', charts[i].element.offsetHeight * pixelRatio);
					charts[i].canvas.setAttribute('style','position:absolute;top:0;left:0;width:'+charts[i].element.offsetWidth+'px;height:'+charts[i].element.offsetHeight+'px');
					
					charts[i].chart.event('resize');
				}
			}
			else{ charts.splice(i, 1); }
		}    
    });
	
	this.create = function( chart, element, data, options )
	{
		if( typeof element == 'string' ){ element = document.getElementById(element); }
		
		if( element && typeof chart_types[chart] != undefined )
		{
			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');
			
			context.mozImageSmoothingEnabled = true;
			context.webkitImageSmoothingEnabled = true;
			context.msImageSmoothingEnabled = true;
			context.imageSmoothingEnabled = true;
			
			canvas.setAttribute('width', element.offsetWidth * pixelRatio);
			canvas.setAttribute('height', element.offsetHeight * pixelRatio);
			canvas.setAttribute('style','position:absolute;top:0;left:0;width:'+element.offsetWidth+'px;height:'+element.offsetHeight+'px');
			
			element.innerHTML = '';
			element.appendChild(canvas);
			
			chart = new chart_types[chart]( canvas, data, options );
			
			canvas.addEventListener('mousemove', function(event)
			{
				var position = viewportPosition( element );
				
				chart.event('mousemove', { x: ( event.pageX - position.x ) * pixelRatio, y: ( event.pageY - position.y ) * pixelRatio });
			});
			
			canvas.addEventListener('mouseout', function(event){ chart.event('mouseout'); });
			
			charts.push({ chart: chart, element: element, canvas: canvas, width: element.offsetWidth, height: element.offsetHeight });
			
			return chart;
		}
		
		return null;
	}
})();