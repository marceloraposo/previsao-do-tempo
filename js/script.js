var templateClima = {
    wsIdentificador: '<put your openwheater lic here',
    tbClima: null,
    linhasClima: [],
    linhasPrevisao: [],
    init: function(){
        templateClima.CarregarPrevisao();

        google.charts.load('current', {'packages':['line']});
        google.charts.setOnLoadCallback(templateClima.CarregarGrafico);        
    },CarregarPrevisao: function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(templateClima.CarregarPosicao);
        } else {
            console.log('O seu navegador não suporta Geolocalização.');
        }
    },
    CarregarPosicao: function (position) {
        templateClima.CarregarTempo(position.coords.latitude, position.coords.longitude);
    },
    CarregarTempo: function (latitude, longitude) {
        $.ajax({
            url: 'https://api.openweathermap.org/data/2.5/forecast?lat=' + latitude + '&lon=' + longitude + '&appid=' + templateClima.wsIdentificador + '&units=metric&lang=pt',
            type: 'get',
            async: false
        })
            .done(function (msg) {

                for (var previsao in msg.list) {
                    templateClima.linhasPrevisao.push([moment(new Date(msg.list[previsao].dt * 1000)).format('DD/MM HH')+'h', msg.list[previsao].main.feels_like, msg.list[previsao].main.temp, msg.list[previsao].main.humidity, msg.list[previsao].main.temp_min, msg.list[previsao].main.temp_max,msg.list[previsao].weather[0].description,msg.list[previsao].weather[0].icon]);
                }
            })
            .fail(function (jqXHR, textStatus, msg) {
                templateClima.linhasPrevisao = [];
            });

        templateClima.CarregarTabela();
    }, 
    CarregarGrafico: function(){


        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Data');
        data.addColumn('number', 'Temperatura');
        data.addColumn('number', 'Sensação');
        data.addColumn('number', 'Mínima');
        data.addColumn('number', 'Máxima');
  
        for (var previsao in templateClima.linhasPrevisao) {
            data.addRow([templateClima.linhasPrevisao[previsao][0],templateClima.linhasPrevisao[previsao][2],templateClima.linhasPrevisao[previsao][1],templateClima.linhasPrevisao[previsao][4],templateClima.linhasPrevisao[previsao][5]]);
        }
  
        var options = {
          chart: {
            title: 'Previsão do tempo',
            subtitle: 'Próximos dias'
          },
          curveType: 'function',
          height: 500,
          series: {
            0: {axis: 'Temperatura'}
          },
          axes: {
            x: {
              0: {side: 'top'}
            },
            y: {
                "Temperatura": {label: 'Temperatura (Celsius)'}
              }            
          }
        };

        var chart = new google.charts.Line(document.getElementById('graficoClima'));
  
        chart.draw(data, google.charts.Line.convertOptions(options));

    } , CarregarTabela: function () {

        templateClima.tbClima = $('#tbClima').DataTable({
            data: templateClima.linhasPrevisao,
            columns: [
                { "title": "Data" },
                { "title": "Sensação" },
                { "title": "Temperatura" },
                { "title": "Umidade" },
                { "title": "Mínima" },
                { "title": "Máxima" },
                { "title": "Tempo" }
            ],
            dom: 'Bfrtip',
            buttons: [],
            autoFill: true,
            colReorder: true,
            select: true,
            keys: true,
            dataSrc: 'group',
            responsive: {
                breakpoints: [
                  {name: 'Data', width: 120},
                  {name: 'Sensação', width: 120},
                  {name: 'Temperatura', width: 120},
                  {name: 'Umidade', width: 120},
                  {name: 'Mínima', width: 120},
                  {name: 'Máxima', width: 120},
                  {name: "Tempo",width: 150 }
                ]
              },
            language: {
                processing: 'Nenhum registro encontrado',
                search: 'Pesquisar',
                lengthMenu: '_MENU_ resultados por página',
                info: 'Mostrando de _START_ até _END_ de _TOTAL_ registros',
                infoEmpty: 'Mostrando 0 até 0 de 0 registros',
                infoFiltered: '(Filtrados de _MAX_ registros)',
                infoPostFix: '',
                loadingRecords: 'Carregando...',
                zeroRecords: 'Nenhum registro encontrado',
                emptyTable: 'Nenhum registro encontrado',
                paginate: {
                    first: 'Primeiro',
                    previous: 'Anterior',
                    next: 'Próximo',
                    last: 'Último'
                },
                aria: {
                    sortAscending: ' Ordenar colunas de forma ascendente',
                    sortDescending: 'Ordenar colunas de forma descendente'
                },
                select: {
                    rows: {
                        _: 'Você selecionou %d linhas',
                        0: 'Clique em uma linha para selecionar',
                        1: 'Apenas uma linha selecionada'
                    }
                }
            }            
        });
        templateClima.tbClima
            .on('select', function (e, dt, type, indexes) {


                for (var i = 0; i < indexes.length; i++) {
                    templateClima.linhasClima.push(templateClima.tbClima.rows(indexes[i]).data().toArray());
                }
            })
            .on('deselect', function (e, dt, type, indexes) {

                for (var i = 0; i < indexes.length; i++) {
                    templateClima.linhasClima.pop(templateClima.tbClima.rows(i).data().toArray());
                }
            });


        $("#selectAllClima").click(function (e) {
            templateClima.tbClima.rows().deselect();
            if ($(this).is(':checked'))
                templateClima.tbClima.rows().select();

            else
                templateClima.tbClima.rows().deselect();
        });

    }
};	