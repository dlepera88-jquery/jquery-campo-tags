/**
 * jquery.campotags.plugin.js
 * @version: v1.17.07-r1
 * @author: Diego Lepera
 *
 * Created by Diego Lepera on 2017-08-17. Please report any bug at
 * https://github.com/dlepera88-jquery/jquery-campo-tags/issues
 *
 * The MIT License (MIT)
 * Copyright (c) 2017 Diego Lepera http://diegolepera.xyz/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished
 * to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** @preserve
 * The MIT License (MIT) https://github.com/dlepera88-jquery/jquery-campo-tags/blob/master/LICENSE
 * Copyright (c) 2017 Diego Lepera http://diegolepera.xyz/
 */

// Verificar se o jQuery foi inicializado
if (jQuery === undefined) {
    console.warn('[Plugin $.fn.campoTags] O jQuery ainda não foi inciado.\nPara utilizar esse plugin é necessário inicializar o jQuery antes.');
} // Fim if

(function ($) {
    var fArquivos = {
        __DIR__: function () {
            // Dessa maneira o src retorna com o domínio (src absoluto)
            // var script_src = $('script[src]').get(0).src;

            // Dessa forma, retorna o src relativo
            var script_src = $('script[src]').attr('src');
            return script_src.substring(0, script_src.lastIndexOf('/')) || '.';
        },

        /**
         * Carregar o tema solicitado pelo desenvolvedor
         * @param  {String} tema Nome do tema
         * @return {Void}
         */
        carregarTema: function (tema) {
            // Carregar o arquivo CSS com o tema solicitado
            var css_tema = fArquivos.__DIR__() + '/jquery-campo-tags/temas/' + tema + '/css/campotags.tema.css';
            $.get(css_tema, function () {
                var $link = $(document.createElement('link')).attr({
                    rel:    'stylesheet',
                    media:  'all',
                    href:   css_tema
                });

                if ($('link[rel="stylesheet"]').length > 0) {
                    $link.insertAfter($('link[rel="stylesheet"]').last());
                } else {
                    $link.appendTo($('head'));
                } // Fim if
            }).fail(function () {
                console.warn('Não foi possível carregar o arquivo %s.', css_tema);
            });
        } // Fim function carregarTema
    };


    var tags = {
        /**
         * Converter o valor do campo para um vetor com todas as tags
         * @param  {jQuery} $campo Instância jQuery do campo
         * @return {Array}         Array com os valores das tags
         */
        campo2tag: function ($campo) {
            return $campo.val() === '' ? [] : $campo.val().split(',');
        },

        /**
         * Adicionar uma tag
         * @param  {Object} evt Objeto event passado como primeiro parâmetros a qualquer
         * eventListern
         * @return {Boolean}    Caso a tag seja criada, retorna FALSE para impedir
         * que a digitação continue
         */
        adicionar: function (nova_tag, $campo, $exibir, $digitar) {
            var tags_atuais = tags.campo2tag($campo);

            // Adicionar o valor da tag ao campo
            if (tags_atuais.indexOf(nova_tag) < 0) {
                tags_atuais.push(nova_tag);
                $campo.val(tags_atuais.join(','));
            } // Fim if

            // Remover o texto da DIV .digitar
            $digitar.text('');

            // Adicionar a tag a DIV de exibição
            $(document.createElement('span')).addClass('tag').text(nova_tag)
                .attr('title', 'Clique para excluir essa tag').appendTo($exibir)
                .on('click.' + $.fn.campoTags.evt_ns, {campo: $campo, exibir: $exibir, digitar: $digitar}, function (evt) {
                    tags.excluir($(this), evt.data.campo, evt.data.exibir, evt.data.digitar);
                });

            // Mostrar a DIV de exibição de tags
            $exibir.css('display', '');
        },

        /**
         * Excluir uma tag
         * @param  {Object} evt Objeto event passado como primeiro parâmetros a qualquer
         * eventListern
         * @return {Void}
         */
        excluir: function ($tag, $campo, $exibir, $digitar) {
            var valor_tag = $tag.text(),
                tags_atuais = tags.campo2tag($campo);

            // Remover o valor da tag do campo
            // * A opção abaixo não funciona bem para essa função, pois ele não
            // reorganiza os índices do array
            // delete tags_atuais[tags_atuais.indexOf(valor_tag)];
            tags_atuais.splice(tags_atuais.indexOf(valor_tag), 1);
            $campo.val(tags_atuais.join(','));

            // Remover a tag atual da DIV de exibição
            $tag.fadeOut('fast', function () {
                $(this).remove();
            });

            // Esconder a DIV de exibição das tags quando não tiver nenhuma tag
            // para ser exibida
            if (tags_atuais.length < 1) {
                $exibir.css('display', 'none');
            } // Fim if

            $digitar.focus();
        }
    };

    $.fn.campoTags = function (opcoes) {
        opcoes = $.extend($.fn.campoTags.opcoes_padrao, opcoes);

        // Carregar o arquivo CSS com o tema solicitado
        fArquivos.carregarTema(opcoes.tema);

        return this.each(function () {
            // Ocultar o campo e convertê-lo em um campo oculto
            var $this = $(this).css('opacity', 0).attr('type', 'hidden');

            // Criar uma DIV que irá envolver o campo por completo e incluir abaixo
            // do campo
            var $div = $(document.createElement('div')).addClass('__jQuery-campoTags ' + opcoes.tema).insertAfter($this);

            // Criar uma outra DIV para exibir os valores das tags
            // * Obs: Deixar essa DIV oculta enquanto não possuir nenhuma tag
            var $tags = $(document.createElement('div')).addClass('exibir-tags').css('display', 'none').appendTo($div);

            // Juntar esses elementos em um objeto para passá-lo para os eventos necessários
            // * event.data
            var evt_data = {campo: $this, exibir: $tags};

            // Criar uma outra DIV para digitar as tags
            var $digitar = $(document.createElement('div')).addClass('digitar-tags').prop('contenteditable', true).appendTo($div)
                .on('keydown.' + $.fn.campoTags.evt_ns, evt_data, function (evt) {
                    var $this = $(this);

                    if ($.inArray(evt.key, $.fn.campoTags.teclas) > -1) {
                        tags.adicionar($this.text(), evt.data.campo, evt.data.exibir, $this);
                        return false;
                    } // Fim if
                });

            // Converter o valor atual do campo em tags
            if ($this.val() !== '') {
                var tags_atuais = tags.campo2tag($this);

                for (var tag in tags_atuais) {
                    tags.adicionar(tags_atuais[tag], $this, $tags, $digitar);
                } // Fim for
            } // Fim if

            return $this;
        });
    };

    /**
     * Namespace dos eventos adicionados pelo plugin
     * @type {String}
     */
    $.fn.campoTags.evt_ns = '__campo-tags';

    /**
     * Opções padrão do plugin
     * @type {Object}
     */
    $.fn.campoTags.opcoes_padrao = {
        /**
         * Nome do tema a ser carregado
         * @type {String}
         */
        tema: 'padrao'
    };

    /**
     * Teclas utilizadas para informar que tag foi concluída
     * @type {Array}
     */
    $.fn.campoTags.teclas = [',', 'Enter', 'Tab'];
})(jQuery);
