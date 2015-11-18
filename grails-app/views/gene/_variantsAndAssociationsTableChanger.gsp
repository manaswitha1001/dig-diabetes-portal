
<g:javascript>

$( document ).ready(function() {
var variantsAndAssociationTable = function (){
    $.ajax({
        cache: false,
        type: "post",
        url: "${createLink(controller: 'gene', action: 'genepValueCounts')}",
        data: {geneName: '<%=geneName%>',
               rowNames:<g:renderRowValues data='${rowInformation}'></g:renderRowValues>,
               colNames:<g:renderColValues data='${columnInformation}'></g:renderColValues>,
               phenotype:'${phenotype}'},
            async: true,
            success: function (data) {


                        var variantsAndAssociationsTableHeaders = {
                    hdr1:'<g:message code="gene.variantassociations.table.colhdr.1" default="data type"/>',
                    hdr2:'<g:message code="gene.variantassociations.table.colhdr.2" default="sample size"/>',
                    hdr3:'<g:message code="gene.variantassociations.table.colhdr.3" default="total variants"/>',
                    gwasSig:'<g:helpText title="gene.variantassociations.table.colhdr.4.help.header" placement="top"
                                         body="gene.variantassociations.table.colhdr.4.help.text" qplacer="2px 0 0 6px"/>'+
                            '<g:message code="gene.variantassociations.table.colhdr.4b" default="genome wide"/>',
                    locusSig:'<g:helpText title="gene.variantassociations.table.colhdr.5.help.header" placement="top"
                                          body="gene.variantassociations.table.colhdr.5.help.text" qplacer="2px 0 0 6px"/>'+
                            '<g:message code="gene.variantassociations.table.colhdr.5b" default="locus wide"/>',
                    nominalSig:'<g:helpText title="gene.variantassociations.table.colhdr.6.help.header" placement="top"
                                            body="gene.variantassociations.table.colhdr.6.help.text" qplacer="2px 0 0 6px"/>'+
                         '<g:message code="gene.variantassociations.table.colhdr.6b" default="nominal"/>'
                };
                var variantsAndAssociationsPhenotypeAssociations = {
                    significantAssociations:'<g:message code="gene.variantassociations.significantAssociations"
                                                        default="variants were associated with" args="[geneName]"/>',
                    noSignificantAssociationsExist:'<g:message code="gene.variantassociations.noSignificantAssociations"
                                                               default="no significant associations"/>'
                };
                var variantsAndAssociationsRowHelpText ={
                     genomeWide:'<g:message code="gene.variantassociations.table.rowhdr.gwas" default="gwas"/>',
                     genomeWideQ:'<g:helpText title="gene.variantassociations.table.rowhdr.gwas.help.header"
                                              qplacer="2px 0 0 6px" placement="right"
                                              body="gene.variantassociations.table.rowhdr.gwas.help.text"/>',
                     exomeChip:'<g:message code="gene.variantassociations.table.rowhdr.exomeChip" default="gwas"/>',
                     exomeChipQ:'<g:helpText title="gene.variantassociations.table.rowhdr.exomeChip.help.header"
                                             qplacer="2px 0 0 6px" placement="right"
                                             body="gene.variantassociations.table.rowhdr.exomeChip.help.text"/>',
                     sigma:'<g:message code="gene.variantassociations.table.rowhdr.sigma" default="gwas"/>',
                     sigmaQ:'<g:helpText title="gene.variantassociations.table.rowhdr.sigma.help.header"
                                         qplacer="2px 0 0 6px" placement="right"
                                         body="gene.variantassociations.table.rowhdr.sigma.help.text"/>',
                     exomeSequence:'<g:message code="gene.variantassociations.table.rowhdr.exomeSequence" default="gwas"/>',
                     exomeSequenceQ:'<g:helpText title="gene.variantassociations.table.rowhdr.exomeSequence.help.header"
                                                 qplacer="2px 0 0 6px" placement="right"
                                                 body="gene.variantassociations.table.rowhdr.exomeSequence.help.text"/>'
                };

                if ((typeof data !== 'undefined') &&
                    (data)){
                        if ((data.geneInfo) &&
                            (data.geneInfo.results)){//assume we have data and process it
                              var collector = [];
                              for (var i = 0 ; i < data.geneInfo.results.length ; i++) {
                                   var d = [];
                                   for (var j = 0 ; j < data.geneInfo.results[i].pVals.length ; j++ ){
                                      d.push(data.geneInfo.results[i].pVals[j].count);
                                   }
                                   collector.push(d);
                                }

                                mpgSoftware.geneInfo.fillTheVariantAndAssociationsTableFromNewApi(data,
${show_gwas},
${show_exchp},
${show_exseq},
                                    '<g:createLink controller="region" action="regionInfo"/>',
                                    '<g:createLink controller="trait" action="traitSearch"/>',
                                    '<g:createLink controller="variantSearch" action="gene"/>',
                                    {variantsAndAssociationsTableHeaders:variantsAndAssociationsTableHeaders,
                                     variantsAndAssociationsPhenotypeAssociations:variantsAndAssociationsPhenotypeAssociations,
                                     variantsAndAssociationsRowHelpText: variantsAndAssociationsRowHelpText},
                                    '${geneChromosome}',${geneExtentBegin},${geneExtentEnd},
<g:renderRowMaps data='${rowInformation}'/>,
<g:renderColMaps data='${columnInformation}'/>,
                                    collector,
                                    '<%=geneName%>',
                                    '<%=phenotype%>'
                                );
                                var rowsToExpand = <g:renderRowValues data='${rowInformation}'></g:renderRowValues>;
                                if (typeof rowsToExpand !== 'undefined') {
                                   for ( var i = 0 ; i < rowsToExpand.length ; i++ ){
                                       jsTreeDataRetriever ('#vandaRow'+i,'${phenotype}',rowsToExpand[i]);
                                   }
                                }

                        }
                    }
                $('[data-toggle="popover"]').popover();
            },
            error: function (jqXHR, exception) {
                loading.hide();
                core.errorReporter(jqXHR, exception);
            }
        });

    };


    variantsAndAssociationTable ();
});

$( document ).ready(function() {
        $.ajax({
            cache: false,
            type: "post",
            url: "${createLink(controller: 'VariantSearch', action: 'retrievePhenotypesAjax')}",
            data: {},
            async: true,
            success: function (data) {
                if (( data !==  null ) &&
                        ( typeof data !== 'undefined') &&
                        ( typeof data.datasets !== 'undefined' ) &&
                        (  data.datasets !==  null ) ) {
                    UTILS.fillPhenotypeCompoundDropdown(data.datasets,'#phenotypeChooser',true);
                    // Can we set the default option on the phenotype list?
                    $('#phenotypeChooser').val('${phenotype}');
                    // resetting the phenotype clears all boxes except for the technology chooser
                    var dataSetChooser = $('#dataSetChooser');
                    dataSetChooser.empty();
                    dataSetChooser.append($("<option>").text("---"));
                    $('#phenotypeChooser').removeAttr('disabled');
                }
            },
            error: function (jqXHR, exception) {
                core.errorReporter(jqXHR, exception);
            }
        });

});
var getTechnologies = function(sel,clearExistingRows){
            $.ajax({
            cache: false,
            type: "post",
            url: "${createLink(controller: 'VariantSearch', action: 'retrieveTechnologiesAjax')}",
            data: {phenotype:sel.value},
            async: true,
            success: function (data) {
                if (( data !==  null ) &&
                    ( typeof data !== 'undefined') &&
                    ( typeof data.technologyList !== 'undefined' ) &&
                    ( typeof data.technologyList.dataset !== 'undefined' ) &&
                    (  data.technologyList.dataset !==  null ) ) {
                        var technologies = data.technologyList.dataset;
                        if (typeof technologies !== 'undefined'){
                            var technologyChooser = $('#technologyChooser');
                            technologyChooser.empty();
                            if (clearExistingRows){
                               $('.savedRowHolder .checkbox label').empty();
                               $('.savedRowHolderLabel').hide()
                            }
                            for ( var i = 0 ; i < technologies.length ; i++ ){
                                if (technologies[i] === "ExSeq") {
                                   technologyChooser.append($("<option>").val(technologies[i]).text("Exome Sequencing"));
                                } else if (technologies[i] === "ExChip") {
                                   technologyChooser.append($("<option>").val(technologies[i]).text("Exome Chip"));
                                } else {
                                   technologyChooser.append($("<option>").val(technologies[i]).text(technologies[i]));
                                }

                            }
                            var ancestryChooser = $('#ancestryChooser');
                            ancestryChooser.empty();
                            ancestryChooser.append($("<option>").text("---"));
                            var dataSetChooser = $('#dataSetChooser');
                            dataSetChooser.empty();
                            dataSetChooser.append($("<option>").text("---"));
                            $('#technologyChooser').removeAttr('disabled');
                        }
                }
            },
            error: function (jqXHR, exception) {
                core.errorReporter(jqXHR, exception);
            }
        });

}
var getAncestries = function(sel){
    $.ajax({
        cache: false,
        type: "post",
        url: "${createLink(controller: 'VariantSearch', action: 'retrieveAncestriesAjax')}",
        data: { technology:sel.value,
                phenotype:$("#phenotypeChooser option:selected").val()},
        async: true,
        success: function (data) {
            if (( data !==  null ) &&
                ( typeof data !== 'undefined') &&
                ( typeof data.ancestryList !== 'undefined' ) &&
                ( typeof data.ancestryList.dataset !== 'undefined' ) &&
                (  data.ancestryList.dataset !==  null ) ) {
                    var ancestries = data.ancestryList.dataset;
                    if (typeof ancestries !== 'undefined'){
                        var ancestryChooser = $('#ancestryChooser');
                        ancestryChooser.empty();
                        for ( var i = 0 ; i < ancestries.length ; i++ ){
                            ancestryChooser.append($("<option>").val(ancestries[i]).text(ancestries[i]));
                        }
                    }
                    var dataSetChooser = $('#dataSetChooser');
                    dataSetChooser.empty();
                    dataSetChooser.append($("<option>").text("---"));
                    $('#ancestryChooser').removeAttr('disabled');
                }
            },
        error: function (jqXHR, exception) {
            core.errorReporter(jqXHR, exception);
        }
    });
}
var getDataSets = function(sel){
    $.ajax({
        cache: false,
        type: "post",
        url: "${createLink(controller: 'VariantSearch', action: 'retrieveSampleGroupsAjax')}",
        data: { ancestry:sel.value,
                phenotype:$("#phenotypeChooser option:selected").val(),
                technology:$("#technologyChooser option:selected").val()},
        async: true,
        success: function (data) {
            if (( data !==  null ) &&
                ( typeof data !== 'undefined') &&
                ( typeof data.dataSetList !== 'undefined' ) &&
                ( typeof data.dataSetList.dataset !== 'undefined' ) &&
                (  data.dataSetList.dataset !==  null ) ) {
                    var dataSets = data.dataSetList.dataset;
                    if (typeof dataSets !== 'undefined'){
                        var dataSetChooser = $('#dataSetChooser');
                        dataSetChooser.empty();
                        for (var key in dataSets) {
                        if (dataSets.hasOwnProperty(key)) {
                                dataSetChooser.append($("<option>").val(key+"^"+dataSets[key]).text( mpgSoftware.trans.translator(key)));
                            }
                        }
                        dataSetChooser.removeAttr('disabled');
                    }
                }
            },
        error: function (jqXHR, exception) {
            core.errorReporter(jqXHR, exception);
        }
        });
}
var jsTreeDataRetriever = function (divId,phenotypeName,sampleGroupName){
    var dataPasser = {phenotype:phenotypeName,sampleGroup:sampleGroupName};
    $(divId).jstree({
          "core" : {
                "animation" : 0,
                "check_callback" : true,
                "themes" : { "stripes" : false },
                'data' : {
                  'type': "post",
                  'url' :  "${createLink(controller: 'VariantSearch', action: 'retrieveJSTreeAjax')}",
                  'data': dataPasser
                }
          },
          "checkbox" : {
            "keep_selected_style" : false,
            "three_state": false
          },
          "plugins" : [ "wholerow", "checkbox" ]
});
};


</g:javascript>
<div class="modal-content" id="dialog">
    <div class="modal-header">
        <h4 class="modal-title" id="dataModalLabel">Variants and Associations table modifier</h4>
    </div>

    <div class="modal-body">
        <g:form role="form" class="dk-modal-form" action="geneInfo" id="${geneName}">
            <div class="dk-modal-form-input-group">
                <h4>Add / hide column</h4>

                <div class="dk-modal-form-input-row">
                    <div class="dk-variant-search-builder-title">
                        Column title (optional)
                    </div>

                    <div class="dk-variant-search-builder-ui">
                        <input  type="text" class="form-control"  name="columnName" id="columnName">
                    </div>
                </div>

                <div class="dk-modal-form-input-row">
                    <div class="dk-variant-search-builder-title">
                        P-value
                    </div>

                    <div class="dk-variant-search-builder-ui">
                        <div class="col-md-3 col-sm-3 col-xs-3">
                            <select class="form-control">
                                <option>&lt;</option>
                                <option>&gt;</option>
                                <option>=</option>
                            </select>
                        </div>

                        <div class="col-md-8 col-sm-8 col-xs-8 col-md-offset-1 col-sm-offset-1 col-xs-offset-1">
                            <g:textField name="pValue" type="text" class="form-control" id="addPValue"/>
                        </div>
                    </div>
                </div>

                <div class="dk-modal-form-input-row">
                    <div class="dk-variant-search-builder-title">
                        Show columns
                    </div>

                    <div class="dk-variant-search-builder-ui">
                        <g:renderColumnCheckboxes data='${columnInformation}'></g:renderColumnCheckboxes>
                    </div>
                </div>
                <h4>Add / hide row</h4>

                <div class="dk-modal-form-input-row">
                    <div class="dk-variant-search-builder-title">
                        Phenotype
                    </div>

                    <div class="dk-variant-search-builder-ui">
                        <select class="form-control" id="phenotypeChooser" name="phenotypeChooser" onchange="getTechnologies(this,true)"  onclick="getTechnologies(this,false)" disabled>

                        </select>
                    </div>
                </div>

                <div class="dk-modal-form-input-row">
                    <div class="dk-variant-search-builder-title">
                        Technology
                    </div>

                    <div class="dk-variant-search-builder-ui">
                        <select class="form-control"  id="technologyChooser" onchange="getAncestries(this)" onclick="getAncestries(this)" disabled>
                            <option selected>---</option>
                        </select>
                    </div>
                </div>

                <div class="dk-modal-form-input-row">
                    <div class="dk-variant-search-builder-title">
                        Ancestry
                    </div>

                    <div class="dk-variant-search-builder-ui">
                        <select class="form-control" id="ancestryChooser" onchange="getDataSets(this)" onclick="getDataSets(this)"  disabled>
                            <option selected>---</option>
                        </select>
                    </div>
                </div>

                <div class="dk-modal-form-input-row">
                    <div class="dk-variant-search-builder-title">
                        Available dataset
                        <div id="jstree"></div>
                    </div>

                    <div class="dk-variant-search-builder-ui">
                        <select class="form-control" name="dataSetChooser" id="dataSetChooser"  disabled>
                            <option selected>---</option>
                        </select>
                    </div>
                </div>

                <div class="dk-modal-form-input-row">
                    <div class="dk-variant-search-builder-title">
                        Row title (optional)
                    </div>

                    <div class="dk-variant-search-builder-ui">
                        <input type="text" class="form-control" name="newRowName"   id="newRowName">
                    </div>
                </div>

                <div class="dk-modal-form-input-row">
                    <div class="dk-variant-search-builder-title savedRowHolderLabel">
                        Show rows
                    </div>

                    <div class="dk-variant-search-builder-ui savedRowHolder">
                        <g:renderRowCheckboxes data='${rowInformation}'></g:renderRowCheckboxes>
                    </div>
                </div>
            </div>
        <button type="submit" id="vandasubmit" class="btn" style="display: none">
        </g:form>
    </div>

    <div class="modal-footer dk-modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" onclick="$('#vandasubmit').click()">Rebuild table</button>
        <button type="button" class="btn btn-warning" data-dismiss="modal" onclick="$('#dialog').dialog('close')">Cancel</button>
    </div>
</div>

