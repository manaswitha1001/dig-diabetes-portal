var mpgSoftware = mpgSoftware || {};


(function () {
    "use strict";


    mpgSoftware.variantInfo = (function () {


        var delayedHowCommonIsPresentation = {},
            delayedCarrierStatusDiseaseRiskPresentation = {},
            delayedBurdenTestPresentation = {},
            delayedIgvLaunch = {},
            externalCalculateDiseaseBurden,
            externalizeCarrierStatusDiseaseRisk,
            externalVariantAssociationStatistics,
            externalizeShowHowCommonIsThisVariantAcrossEthnicities,
            describeImpactOfVariantOnProtein
            ;


        var retrieveFieldsByName = function (mapFromApi, listOfFieldNames) {
            // walk through and find out which field fits where

            var returnValue = {};
            if ((mapFromApi) && (mapFromApi.length > 0) &&
                (listOfFieldNames) && (listOfFieldNames.length > 0)) {
                var mapToTheFields = {};
                var lengthOfMap = mapFromApi.length;
                for (var i = 0; i < lengthOfMap; i++) {
                    // walk through the map to find the keys.  Expecting exactly one
                    for (var key in mapFromApi[i]) {
                        if (mapFromApi[i].hasOwnProperty(key)) {
                            mapToTheFields[key] = i;
                        }
                    }
                }
                for (var i = 0; i < listOfFieldNames.length; i++) {
                    var currentName = listOfFieldNames[i];
                    returnValue[currentName] = mapFromApi[mapToTheFields[currentName]][currentName];
                }
            }
            return returnValue;
        };

        var variantAssociations = function (cProperties,pProperties, variantTitle, traitsStudiedUrlRoot, variantAssociationStrings,selectorForBoxes, prominentBoxes) {
            var weHaveVariantsAndAssociations;
            weHaveVariantsAndAssociations = true;

            UTILS.verifyThatDisplayIsWarranted(weHaveVariantsAndAssociations, $('#VariantsAndAssociationsExist'), $('#VariantsAndAssociationsNoExist'));
            if (weHaveVariantsAndAssociations) {
                $(selectorForBoxes).empty();
                for ( var i = 0 ; i < pProperties.length ; i++ ){
                    var propertiesForDataSet = pProperties[i];
                    var dealingWithBeta = (typeof propertiesForDataSet['beta_value'] !== 'undefined');
                    $(selectorForBoxes).append(privateMethods.describeAssociationsStatistics(
                        true,
                        propertiesForDataSet['p_value'],
                        propertiesForDataSet['or_value'],
                        propertiesForDataSet['beta_value'],
                        5e-8,
                        5e-4,
                        5e-2,
                        variantTitle,
                        mpgSoftware.trans.translator(propertiesForDataSet['dataset']),
                        selectorForBoxes,
                        dealingWithBeta,
                        variantAssociationStrings,
                        prominentBoxes ));
                }
            }
        };

        var describeImpactOfVariantOnProtein = function (variant, variantTitle, impactOnProtein) {
            $('#effectOfVariantOnProtein').append(privateMethods.variantGenerateProteinsChooser(variant, variantTitle, impactOnProtein));
            UTILS.verifyThatDisplayIsWarranted(variant["_13k_T2D_TRANSCRIPT_ANNOT"], $('#variationInfoEncodedProtein'), $('#puntOnNoncodingVariant'));
        };


        var setTitlesAndTheLikeFromData = function (varId,dbsnpId,mostdelscore,gene,closestGene, searchString,liesInString,isNearestToString) {
            var variantTitle = searchString;
            if ((typeof dbsnpId !== 'undefined')  &&
                (dbsnpId !== null) &&
                (dbsnpId !== "null") &&
                (dbsnpId.length > 0)){
                variantTitle = dbsnpId;
            } else if ((typeof varId !== 'undefined')  &&
                (varId !== null) &&
                (varId !== "null") &&
                (varId.length > 0)){
                variantTitle = varId;
            }
            var inGene = ((gene != null) && (mostdelscore<4));
            $('#variantTitleInAssociationStatistics').append(variantTitle);
            $('#variantCharacterization').append(UTILS.getSimpleVariantsEffect(mostdelscore));
            $('#describingVariantAssociation').append(UTILS.variantInfoHeaderSentence(inGene,closestGene,gene,liesInString,isNearestToString));
            $('#effectOnCommonProteinsTitle').append(variantTitle);
            $('#variantTitle').append(variantTitle);
            $('#exomeDataExistsTheMinorAlleleFrequency').append(variantTitle);
            $('#populationsHowCommonIs').append(variantTitle);
            $('#exploreSurroundingSequenceTitle').append(variantTitle);
        };


        /***
         * We need to encapsulate a bunch of methods in order to retain control of everything that's going on.
         * Therefore define a function and surface only those methods that absolutely need to be public.
         *
         * @type {{showPercentageAcrossEthnicities: showPercentageAcrossEthnicities,
     * fillHowCommonIsUpBarChart: fillHowCommonIsUpBarChart,
     * fillCarrierStatusDiseaseRisk: fillCarrierStatusDiseaseRisk,
     * showEthnicityPercentageWithBarChart: showEthnicityPercentageWithBarChart,
     * showCarrierStatusDiseaseRisk: showCarrierStatusDiseaseRisk,
     * variantGenerateProteinsChooserTitle: variantGenerateProteinsChooserTitle,
     * variantGenerateProteinsChooser: variantGenerateProteinsChooser,
     * fillUpBarChart: fillUpBarChart,
     * fillDiseaseRiskBurdenTest: fillDiseaseRiskBurdenTest}}
         */
        var privateMethods = (function () {
            var calculateSearchRegion = function (data) {
                    var searchBand = 50000;// 50 kb
                    var returnValue = "";
                    if (data) {
                        var variant = {}
                        var i;
                        for(i = 0; i < data.length; i++) {
                            if(typeof data[i]["CHROM"] !== 'undefined') { variant["CHROM"] = data[i]["CHROM"]; }
                            if(typeof data[i]["POS"] !== 'undefined') { variant["POS"] = data[i]["POS"]; }
                        }
                        if ((typeof variant["CHROM"] !== 'undefined') &&
                            (typeof variant["POS"] !== 'undefined')) { // an't do anything without chromosome number and sequence position
                            var chromosomeIdentifier = variant["CHROM"];  // String
                            var position = variant["POS"];// number
                            var beginPosition = Math.max(0, position - searchBand);
                            var endPosition = position + searchBand;
                            returnValue = "chr" + chromosomeIdentifier + ":" + beginPosition + "-" + endPosition;
                        }
                    }
                    return returnValue;
                },
                describeAssociationsStatistics = function (availableData, pValue, orValue, betaValue, strongCutOff, mediumCutOff, weakCutOff, variantTitle, datatype, selectorForBoxes,
                                                           takeExpOfOr, variantAssociationStrings, prominentBoxes) {
                    var retVal = "";
                    var significanceDescriptor = "";
                    var orValueNumerical;
                    var orValueNumericalAdjusted;
                    var orValueText = "";
                    var pNumericalValue = pValue;
                    var pTextValue = "";
                    var textModifier = "";
                    if (!prominentBoxes) {
                        textModifier = "small";
                    }
                    if (availableData && (pValue !== null) && (orValue !== null)) {
                        //retVal += "<div class='boxyDisplay ";
                        retVal += "<li class='";
                        // may or may not be bold
                        if (pNumericalValue <= strongCutOff) {
                            retVal += "genomeWideSignificant"+textModifier+"'>";
                            significanceDescriptor = variantAssociationStrings.genomeSignificance;
                        } else if ((pNumericalValue > strongCutOff) &&
                            (pNumericalValue <= mediumCutOff )) {
                            retVal += "locusWideSignificant"+textModifier+"'>";
                            significanceDescriptor = variantAssociationStrings.locusSignificance;
                        } else if ((pNumericalValue > mediumCutOff) &&
                            (pNumericalValue <= weakCutOff )) {
                            retVal += "nominallySignificant"+textModifier+"'>";
                            significanceDescriptor = variantAssociationStrings.nominalSignificance;
                        } else {
                            retVal += "notSignificant"+textModifier+"'>";
                            significanceDescriptor = "not significant";
                        }
                        // always needs descr
                        pTextValue = pNumericalValue.toPrecision(3);
                        retVal += ("<div class='superImportantText"+textModifier+"'>" + datatype + "</div>");
                        retVal += ("<div class='veryImportantText"+textModifier+"'>p = " + pTextValue );
                        if (prominentBoxes) {
                            retVal += (variantAssociationStrings.associationPValueQ);
                        }
                        retVal += ("</div>");
                        retVal += ("<div class='notVeryImportantText"+textModifier+"'>" + significanceDescriptor + "</div>");
                        if (((orValue)||(betaValue)) &&
                            ((orValue !== 'null')||(betaValue !== 'null'))) {
                            orValueNumericalAdjusted = (takeExpOfOr === true) ? Math.exp(betaValue) : orValue;
                            orValueText = orValueNumericalAdjusted.toPrecision(3);
                            retVal += ("<div class='veryImportantText"+textModifier+"'>"+((takeExpOfOr === true) ? 'BETA' : 'OR')+" = " + orValueText );
                            if (prominentBoxes) {
                                retVal += (variantAssociationStrings.associationOddsRatioQ);
                            }
                            retVal += ("</div>");
                        }
                    } else {
                        retVal += '';
                    }
                    return retVal;
                },


                fillHowCommonIsUpBarChart = function (freqInformation) {
                    if ((typeof freqInformation !== 'undefined') &&
                        (freqInformation.length > 0)) {
                        var dataForBarChart = [];
                        var summaryChart = (freqInformation.length < 10);
                        var chartHeight = (summaryChart)?250:550;
                        var useSmallText = (summaryChart)?0:1;
                        for ( var i = 0 ; i < freqInformation.length ; i++ ){
                            var cohort = freqInformation[i];
                            var cohortInfo = cohort.level;
                            var cohortFields = cohortInfo.split("^");
                            var displayableCohortName = "unknown ancestry";
                            var translatedCohortName = "unknown ancestry";
                            if (cohortFields.length > 4){
                                translatedCohortName = mpgSoftware.trans.translator( cohortFields [3] );
                                displayableCohortName = mpgSoftware.trans.translator( cohortFields [4] );
                            }
                            dataForBarChart.push({ value: cohort.count,
                                position: i,
                                barname: displayableCohortName,
                                barsubname: '',
                                barsubnamelink: '',
                                inbar: '',
                                descriptor: ('('+translatedCohortName+')')})
                        }
                        var sortedDataForBarChart = dataForBarChart.sort(function (a, b) {
                            if (a.barname > b.barname) {
                                return 1;
                            }
                            if (a.barname < b.barname) {
                                return -1;
                            }
                            if (a.value > b.value) {
                                return 1;
                            }
                            if (a.value < b.value) {
                                return -1;
                            }

                            return 0;
                        });
                        for ( var i = 0 ; i < sortedDataForBarChart.length ; i++ ) {
                            sortedDataForBarChart[i].position = i;
                        }
                        var allAlleleValues = freqInformation.map(function(obj){
                            return obj.count;
                        });

                            var roomForLabels = 120;
                            var maximumPossibleValue = (Math.max( ...allAlleleValues ) * 1.5);
                            var labelSpacer = 10;

                        var margin = {top: 20, right: 20, bottom: 0, left: 40},
                            width = 800 - margin.left - margin.right,
                            height = chartHeight - margin.top - margin.bottom;

                        var commonBarChart = baget.barChart('howCommonIsChart')
                            .width(width)
                            .height(height)
                            .margin(margin)
                            .roomForLabels(roomForLabels)
                            .maximumPossibleValue(maximumPossibleValue)
                            .labelSpacer(labelSpacer)
                            .smallDescriptorText(useSmallText)
                            .dataHanger("#howCommonIsChart", sortedDataForBarChart);
                        d3.select("#howCommonIsChart").call(commonBarChart.render);
                        return commonBarChart;
                    }

                },



//                fillHowCommonIsUpBarChart = function (africanAmericanFrequency, hispanicFrequency, eastAsianFrequency, southAsianFrequency, europeanSequenceFrequency, europeanChipFrequency, alleleFrequencyStrings) {
//                    if ((typeof africanAmericanFrequency !== 'undefined')) {
//                        var dataForBarChart = [
//                                { value: africanAmericanFrequency,
//                                    position: 2,
//                                    barname: alleleFrequencyStrings.africanAmerican,
//                                    barsubname: '',
//                                    barsubnamelink: '',
//                                    inbar: '',
//                                    descriptor: ''},
//                                {value: hispanicFrequency,
//                                    position: 4,
//                                    barname: alleleFrequencyStrings.hispanic,
//                                    barsubname: '',
//                                    barsubnamelink: '',
//                                    inbar: '',
//                                    descriptor: ''},
//                                { value: eastAsianFrequency,
//                                    position: 6,
//                                    barname: alleleFrequencyStrings.eastAsian,
//                                    barsubname: '',
//                                    barsubnamelink: '',
//                                    inbar: '',
//                                    descriptor: ''},
//                                {  value: southAsianFrequency,
//                                    position: 8,
//                                    barname: alleleFrequencyStrings.southAsian,
//                                    barsubname: '',
//                                    barsubnamelink: '',
//                                    inbar: '',
//                                    descriptor: ''},
//                                { value: europeanSequenceFrequency,
//                                    position: 10,
//                                    barname: alleleFrequencyStrings.european,
//                                    barsubname: '',
//                                    barsubnamelink: '',
//                                    inbar: '',
//                                    descriptor: alleleFrequencyStrings.exomeSequence},
//                                { value: europeanChipFrequency,
//                                    position: 11,
//                                    barname: ' ',
//                                    barsubname: '',
//                                    barsubnamelink: '',
//                                    inbar: '',
//                                    descriptor: ((typeof europeanChipFrequency !== 'undefined' ) ? alleleFrequencyStrings.exomeChip : '')}
//                            ],
//                            roomForLabels = 120,
//                            maximumPossibleValue = (Math.max(africanAmericanFrequency, hispanicFrequency, eastAsianFrequency, southAsianFrequency, europeanSequenceFrequency, europeanChipFrequency) * 1.5),
//                            labelSpacer = 10;
//
//                        var margin = {top: 20, right: 20, bottom: 0, left: 70},
//                            width = 800 - margin.left - margin.right,
//                            height = 300 - margin.top - margin.bottom;
//
//                        var commonBarChart = baget.barChart('howCommonIsChart')
//                            .width(width)
//                            .height(height)
//                            .margin(margin)
//                            .roomForLabels(roomForLabels)
//                            .maximumPossibleValue(maximumPossibleValue)
//                            .labelSpacer(labelSpacer)
//                            .dataHanger("#howCommonIsChart", dataForBarChart);
//                        d3.select("#howCommonIsChart").call(commonBarChart.render);
//                        return commonBarChart;
//                    }
//
//                },
                fillCarrierStatusDiseaseRisk = function (homozygCase, heterozygCase, nonCarrierCase, homozygControl, heterozygControl, nonCarrierControl, carrierStatusImpact) {
                    if ((typeof homozygCase !== 'undefined')) {
                        var data3 = [
                                { value: 1,
                                    position: 1,
                                    barname: carrierStatusImpact.casesTitle,
                                    barsubname: '',
                                    barsubnamelink: '',
                                    inbar: '',
                                    descriptor: '(' + carrierStatusImpact.designationTotal + ' ' + (+nonCarrierCase) + ')',
                                    inset: 1 },
                                { value: homozygCase,
                                    position: 2,
                                    barname: ' ',
                                    barsubname: '',
                                    barsubnamelink: '',
                                    inbar: '',
                                    descriptor: '',
                                    legendText: carrierStatusImpact.legendTextHomozygous},
                                {value: heterozygCase,
                                    position: 3,
                                    barname: '  ',
                                    barsubname: '',
                                    barsubnamelink: '',
                                    inbar: '',
                                    descriptor: '',
                                    legendText: carrierStatusImpact.legendTextHeterozygous},
                                { value: nonCarrierCase - (homozygCase + heterozygCase),
                                    position: 4,
                                    barname: '   ',
                                    barsubname: '',
                                    barsubnamelink: '',
                                    inbar: '',
                                    descriptor: '',
                                    legendText: carrierStatusImpact.legendTextNoncarrier},
                                {  value: 1,
                                    position: 6,
                                    barname: carrierStatusImpact.controlsTitle,
                                    barsubname: '',
                                    barsubnamelink: '',
                                    inbar: '',
                                    descriptor: '(' + carrierStatusImpact.designationTotal + ' ' + (nonCarrierControl) + ')',
                                    inset: 1 },
                                {  value: homozygControl,
                                    position: 7,
                                    barname: '    ',
                                    barsubname: '',
                                    barsubnamelink: '',
                                    inbar: '',
                                    descriptor: ''},
                                { value: heterozygControl,
                                    position: 8,
                                    barname: '     ',
                                    barsubname: '',
                                    barsubnamelink: '',
                                    inbar: '',
                                    descriptor: ''},
                                { value: nonCarrierControl - (homozygControl + heterozygControl),
                                    position: 9,
                                    barname: '      ',
                                    barsubname: '',
                                    barsubnamelink: '',
                                    inbar: '',
                                    descriptor: ''}

                            ],
                            roomForLabels = 20,
                            maximumPossibleValue = (Math.max(homozygCase, heterozygCase, nonCarrierCase, homozygControl, heterozygControl, nonCarrierControl) * 1.5),
                            labelSpacer = 10;

                        var margin = {top: 140, right: 20, bottom: 0, left: 0},
                            width = 800 - margin.left - margin.right,
                            height = 520 - margin.top - margin.bottom;

                        var barChart = baget.barChart('carrierStatusDiseaseRiskChart')
                            .selectionIdentifier("#carrierStatusDiseaseRiskChart")
                            .width(width)
                            .height(height)
                            .margin(margin)
                            .roomForLabels(roomForLabels)
                            .maximumPossibleValue(10000)
                            .labelSpacer(labelSpacer)
                            .assignData(data3)
                            .integerValues(1)
                            .logXScale(1)
                            .customBarColoring(1)
                            .customLegend(1)
                            .dataHanger("#carrierStatusDiseaseRiskChart", data3);
                        d3.select("#carrierStatusDiseaseRiskChart").call(barChart.render);
                        return barChart;
                    }

                },

                showEthnicityPercentageWithBarChart = function (ethnicityPercentages) {
                    var retainBarchartPtr;

                    // We have everything we need to build the bar chart.  Store the functional reference in an object
                    // that we can call whenever we want
                    delayedHowCommonIsPresentation = {
                        barchartPtr: retainBarchartPtr,
                        launch: function () {

                            retainBarchartPtr = fillHowCommonIsUpBarChart(ethnicityPercentages);

                            return retainBarchartPtr;
                        },
                        removeBarchart: function () {
                            if ((typeof retainBarchartPtr !== 'undefined') &&
                                (typeof retainBarchartPtr.clear !== 'undefined')) {
                                retainBarchartPtr.clear('howCommonIsChart');
                            }
                        }

                    }
                },

                showCarrierStatusDiseaseRisk = function (OBSU, OBSA, HOMA, HETA, HOMU, HETU, show_gwas, show_exchp, show_exseq, carrierStatusImpact) {
                    var heta = 1, hetu = 1, totalCases = 1,
                        homa = 1, homu = 1, totalControls = 1,
                        retainBarchartPtr;
                    try {
                        if (show_exseq) {
                            heta = HETA;
                            hetu = HETU;
                            homa = HOMA;
                            homu = HOMU;
                            totalCases = OBSA;
                            totalControls = OBSU;
                        }


                    } catch (e) {
                    }

                    delayedCarrierStatusDiseaseRiskPresentation = {
                        barchartPtr: retainBarchartPtr,
                        launch: function () {
                            d3.select('#carrierStatusDiseaseRiskChart').select('svg').remove();
                            retainBarchartPtr = fillCarrierStatusDiseaseRisk(homa,
                                heta,
                                totalCases,
                                homu,
                                hetu,
                                totalControls,
                                carrierStatusImpact);
                            return retainBarchartPtr;
                        },
                        removeBarchart: function () {
                            if ((typeof retainBarchartPtr !== 'undefined') &&
                                (typeof retainBarchartPtr.clear !== 'undefined')) {
                                retainBarchartPtr.clear('carrierStatusDiseaseRiskChart');
                            }
                        }

                    }

                },
//                variantGenerateProteinsChooserTitle = function (variant, title, impactOnProtein) {
//                    var retVal = "";
//                    retVal += ""+impactOnProtein.subtitle;
//                    return retVal;
//                },
                variantGenerateProteinsChooser = function (variant, title, impactOnProtein) {
                    var retVal = "";
                    if (variant.MOST_DEL_SCORE && variant.MOST_DEL_SCORE < 4) {
                        retVal += "<p>" + impactOnProtein.chooseOneTranscript + "</p>";
                        var allKeys = Object.keys(variant._13k_T2D_TRANSCRIPT_ANNOT);
                        for (var i = 0; i < allKeys.length; i++) {
                            var checked = (i == 0) ? ' checked ' : '';
                            var annotation = variant._13k_T2D_TRANSCRIPT_ANNOT[allKeys[i]];
                            retVal += ("<div class=\"radio-inline\">\n" +
                                "<label>\n" +
                                "<input " + checked + " class='transcript-radio' type='radio' name='transcript_check' id='transcript-" + allKeys[i] +
                                "' value='" + allKeys[i] + "' onclick='UTILS.variantInfoRadioChange(" +
                                "\"" + annotation['PolyPhen_SCORE'] + "\"," +
                                "\"" + annotation['SIFT_SCORE'] + "\"," +
                                "\"" + annotation['Condel_SCORE'] + "\"," +
                                "\"" + annotation['MOST_DEL_SCORE'] + "\"," +
                                "\"" + annotation['_13k_ANNOT_29_mammals_omega'] + "\"," +
                                "\"" + annotation['Protein_position'] + "\"," +
                                "\"" + annotation['Codons'] + "\"," +
                                "\"" + annotation['Protein_change'] + "\"," +
                                "\"" + annotation['PolyPhen_PRED'] + "\"," +
                                "\"" + annotation['Consequence'] + "\"," +
                                "\"" + annotation['Condel_PRED'] + "\"," +
                                "\"" + annotation['SIFT_PRED'] + "\"" +
                                ")' >\n" +
                                allKeys[i] + "\n" +
                                "</label>\n" +
                                "</div>\n");
                        }
                        if (allKeys.length > 0) {
                            var annotation = variant._13k_T2D_TRANSCRIPT_ANNOT[allKeys[0]];
                            UTILS.variantInfoRadioChange(annotation['PolyPhen_SCORE'],
                                annotation['SIFT_SCORE'],
                                annotation['Condel_SCORE'],
                                annotation['MOST_DEL_SCORE'],
                                annotation['_13k_ANNOT_29_mammals_omega'],
                                annotation['Protein_position'],
                                annotation['Codons'],
                                annotation['Protein_change'],
                                annotation['PolyPhen_PRED'],
                                annotation['Consequence'],
                                annotation['Condel_PRED'],
                                annotation['SIFT_PRED']);

                        }


                    }
                    return retVal;
                },
                fillUpBarChart = function (peopleWithDiseaseNumeratorString, peopleWithDiseaseDenominatorString, peopleWithoutDiseaseNumeratorString, peopleWithoutDiseaseDenominatorString, diseaseBurdenStrings) {
                    var peopleWithDiseaseDenominator,
                        peopleWithoutDiseaseDenominator,
                        peopleWithDiseaseNumerator,
                        peopleWithoutDiseaseNumerator,
                        calculatedPercentWithDisease,
                        calculatedPercentWithoutDisease,
                        proportionWithDiseaseDescriptiveString,
                        proportionWithoutDiseaseDescriptiveString;
                    if ((typeof peopleWithDiseaseDenominatorString !== 'undefined') &&
                        (typeof peopleWithoutDiseaseDenominatorString !== 'undefined')) {
                        peopleWithDiseaseDenominator = parseInt(peopleWithDiseaseDenominatorString);
                        peopleWithoutDiseaseDenominator = parseInt(peopleWithoutDiseaseDenominatorString);
                        peopleWithDiseaseNumerator = parseInt(peopleWithDiseaseNumeratorString);
                        peopleWithoutDiseaseNumerator = parseInt(peopleWithoutDiseaseNumeratorString);
                        if (( peopleWithDiseaseDenominator !== 0 ) &&
                            ( peopleWithoutDiseaseDenominator !== 0 )) {
                            calculatedPercentWithDisease = (100 * (peopleWithDiseaseNumerator / (2 * peopleWithDiseaseDenominator)));
                            calculatedPercentWithoutDisease = (100 * (peopleWithoutDiseaseNumerator / (2 * peopleWithoutDiseaseDenominator)));
                            proportionWithDiseaseDescriptiveString = "(" + peopleWithDiseaseNumerator + " out of " + peopleWithDiseaseDenominator + ")";
                            proportionWithoutDiseaseDescriptiveString = "(" + peopleWithoutDiseaseNumerator + " out of " + peopleWithoutDiseaseDenominator + ")";
                            var dataForBarChart = [
                                    { value: calculatedPercentWithDisease,
                                        barname: diseaseBurdenStrings.controlBarName,
                                        barsubname: diseaseBurdenStrings.controlBarSubName,
                                        barsubnamelink: '',
                                        inbar: '',
                                        descriptor: proportionWithDiseaseDescriptiveString},
                                    {value: calculatedPercentWithoutDisease,
                                        barname: diseaseBurdenStrings.caseBarName,
                                        barsubname: diseaseBurdenStrings.caseBarSubName,
                                        barsubnamelink: '',
                                        inbar: '',
                                        descriptor: proportionWithoutDiseaseDescriptiveString}
                                ],
                                roomForLabels = 120,
                                maximumPossibleValue = (Math.max(calculatedPercentWithDisease, calculatedPercentWithoutDisease) * 1.5),
                                labelSpacer = 10;

                            var margin = {top: 0, right: 20, bottom: 0, left: 70},
                                width = 800 - margin.left - margin.right,
                                height = 150 - margin.top - margin.bottom;


                            var barChart = baget.barChart('diseaseRiskChart')
                                .selectionIdentifier("#diseaseRiskChart")
                                .width(width)
                                .height(height)
                                .margin(margin)
                                .roomForLabels(roomForLabels)
                                .maximumPossibleValue(maximumPossibleValue)
                                .labelSpacer(labelSpacer)
                                .assignData(dataForBarChart)
                                .dataHanger("#diseaseRiskChart", dataForBarChart);
                            d3.select("#diseaseRiskChart").call(barChart.render);
                            return barChart;
                        }
                    }
                },

                fillDiseaseRiskBurdenTest = function (OBSU, OBSA, MINA, MINU, PVALUE, ORVALUE, show_gwas, show_exchp, show_exseq, rootVariantUrl, diseaseBurdenStrings) {
                    var mina = 0,
                        minu = 0,
                        totalUnaffected = 0,
                        totalAffected = 0,
                        pValue = 0,
                        retainBarchartPtr,
                        oddsRatio;
                    if (show_exseq) {
                        mina = MINA;
                        minu = MINU;
                        totalUnaffected = OBSU;
                        totalAffected = OBSA;
                        pValue = PVALUE;
                        oddsRatio = ORVALUE;
                    }

                    // variables for bar chart
                    var numeratorUnaffected,
                        denominatorUnaffected,
                        numeratorAffected,
                        denominatorAffected;
                    if ((totalUnaffected) && (totalAffected)) {
                        numeratorUnaffected = minu;
                        numeratorAffected = mina;
                        denominatorUnaffected = totalUnaffected;
                        denominatorAffected = totalAffected;
                        delayedBurdenTestPresentation = {
                            functionToRun: fillUpBarChart,
                            barchartPtr: retainBarchartPtr,
                            launch: function () {
                                retainBarchartPtr = fillUpBarChart(numeratorUnaffected, denominatorUnaffected, numeratorAffected, denominatorAffected, diseaseBurdenStrings);
                                if (pValue > 0) {
                                    var degreeOfSignificance = '';
                                    // TODO the p's below are piling up.  clean them out
                                    //   $('#describePValueInDiseaseRisk').remove();
                                    $('#describePValueInDiseaseRisk').append("<p class='slimDescription'>" + degreeOfSignificance + "</p>\n" +
                                        "<p  id='bhtMetaBurdenForDiabetes' class='slimAndTallDescription'>p=" + (pValue.toPrecision(3)) +
                                        diseaseBurdenStrings.diseaseBurdenPValueQ + "</p>");
                                    if (typeof oddsRatio !== 'undefined') {
                                        $('#describePValueInDiseaseRisk').append("<p  id='bhtOddsRatioForDiabetes' class='slimAndTallDescription'>OR=" +
                                            UTILS.realNumberFormatter(oddsRatio) + diseaseBurdenStrings.diseaseBurdenOddsRatioQ + "</p>");
                                    }
                                }
                                return retainBarchartPtr;
                            },
                            removeBarchart: function () {
                                if ((typeof retainBarchartPtr !== 'undefined') &&
                                    (typeof retainBarchartPtr.clear !== 'undefined')) {
                                    retainBarchartPtr.clear('diseaseRiskChart');
                                }
                            }
                        };
                    }
                };



            return {
                // note that that the following methods are never accessed directly and can thus remain private
                //showPercentageAcrossEthnicities: showPercentageAcrossEthnicities,
                //fillHowCommonIsUpBarChart: fillHowCommonIsUpBarChart,
                //fillCarrierStatusDiseaseRisk: fillCarrierStatusDiseaseRisk,
                // fillUpBarChart: fillUpBarChart,

                // public routines
                calculateSearchRegion: calculateSearchRegion,
                showEthnicityPercentageWithBarChart: showEthnicityPercentageWithBarChart,
                showCarrierStatusDiseaseRisk: showCarrierStatusDiseaseRisk,
                // variantGenerateProteinsChooserTitle: variantGenerateProteinsChooserTitle,
                variantGenerateProteinsChooser: variantGenerateProteinsChooser,
                fillDiseaseRiskBurdenTest: fillDiseaseRiskBurdenTest,
                describeAssociationsStatistics: describeAssociationsStatistics
            }


        }());  // end of private methods


        /***
         * Here is the main publicly available method in this module, which ends up driving, directly or indirectly, most
         * of the rest of the JavaScript code in this file. This method gets executed after the Ajax calls returns with the data.
         *
         *
         * @param data
         * @param variantToSearch
         * @param traitsStudiedUrlRoot
         * @param restServerRoot
         * @param showGwas
         * @param showExchp
         * @param showExseq
         */
        var variantPosition;
        function fillTheFields(data, variantToSearch, traitsStudiedUrlRoot, restServerRoot) {
            var variantObj = data['variant'],
                variant = variantObj['variants'][0],
                prepareDelayedIgvLaunch = function (variant, restServerRoot) {
                    /***
                     * store everything we need to launch IGV
                     */
                    var regionforIgv = privateMethods.calculateSearchRegion(variant);
                    return {
                        rememberRegion: regionforIgv,
                        launch: function () {
                            igvLauncher.launch("#myVariantDiv", regionforIgv, restServerRoot, [1, 1, 1, 0]);
                        }
                    };
                },
                prepareIgvLaunch = function (variant, restServerRoot) {
                   return {locus:privateMethods.calculateSearchRegion(variant),
                           server:restServerRoot};
                },
             externalVariantAssociationStatistics = variantAssociations;
            var calculateDiseaseBurden = function (OBSU, OBSA, MINA, MINU, HOMA, HETA, HOMU, HETU, PVALUE, ORVALUE, variantTitle, showGwas, showExchp, showExseq, diseaseBurdenStrings) {// disease burden
                var weHaveEnoughDataForRiskBurdenTest;
                weHaveEnoughDataForRiskBurdenTest = (!UTILS.nullSafetyTest([OBSU, OBSA, MINA, MINU ]));
                UTILS.verifyThatDisplayIsWarranted(weHaveEnoughDataForRiskBurdenTest, $('#diseaseRiskExists'), $('#diseaseRiskNoExists'));
                if (weHaveEnoughDataForRiskBurdenTest) {
                    privateMethods.fillDiseaseRiskBurdenTest(OBSU, OBSA, MINA, MINU, PVALUE, ORVALUE, showGwas, showExchp, showExseq, null, diseaseBurdenStrings);
                }
            };
            // externalize!
            // externalize!
            externalCalculateDiseaseBurden = calculateDiseaseBurden;
            var howCommonIsThisVariantAcrossEthnicities = function (ethnicityPercentages) {// how common is this allele across different ethnicities
                var weHaveEnoughDataToDescribeMinorAlleleFrequencies = (!UTILS.nullSafetyTest([ethnicityPercentages[0].count]));
                UTILS.verifyThatDisplayIsWarranted(weHaveEnoughDataToDescribeMinorAlleleFrequencies, $('#howCommonIsExists'), $('#howCommonIsNoExists'));
                if (weHaveEnoughDataToDescribeMinorAlleleFrequencies) {
                    privateMethods.showEthnicityPercentageWithBarChart(ethnicityPercentages);
                }
            };
            externalizeShowHowCommonIsThisVariantAcrossEthnicities = howCommonIsThisVariantAcrossEthnicities;
            var showHowCarriersAreDistributed = function (OBSU, OBSA, HOMA, HETA, HOMU, HETU, showGwas, showExchp, showExseq, carrierStatusImpact) {// case control data set characterization
                var weHaveEnoughDataToCharacterizeCaseControls;
                weHaveEnoughDataToCharacterizeCaseControls = (!UTILS.nullSafetyTest([OBSU, OBSA, HOMA, HETA, HOMU, HETU  ]));
                UTILS.verifyThatDisplayIsWarranted(weHaveEnoughDataToCharacterizeCaseControls, $('#carrierStatusExist'), $('#carrierStatusNoExist'));
                if (weHaveEnoughDataToCharacterizeCaseControls) {
                    privateMethods.showCarrierStatusDiseaseRisk(OBSU, OBSA, HOMA, HETA, HOMU, HETU, showGwas, showExchp, showExseq, carrierStatusImpact);
                }
            };
            externalizeCarrierStatusDiseaseRisk = showHowCarriersAreDistributed;
            var oldDescribeImpactOfVariantOnProtein = function (variant, variantTitle, impactOnProtein) {
                $('#effectOfVariantOnProteinTitle').append(privateMethods.variantGenerateProteinsChooserTitle(variant, variantTitle, impactOnProtein));
                $('#effectOfVariantOnProtein').append(privateMethods.variantGenerateProteinsChooser(variant, variantTitle, impactOnProtein));
                UTILS.verifyThatDisplayIsWarranted(variant["_13k_T2D_TRANSCRIPT_ANNOT"], $('#variationInfoEncodedProtein'), $('#puntOnNoncodingVariant'));
            };


            /***
             * the following top-level routines do all the work in fillTheFields
             */
            //setTitlesAndTheLikeFromData(variantTitle, variant);
            delayedIgvLaunch = prepareDelayedIgvLaunch(variant, restServerRoot);
            variantPosition = prepareIgvLaunch(variant, restServerRoot);



       };

        var retrieveDelayedHowCommonIsPresentation = function () {
                return delayedHowCommonIsPresentation;
            },
            retrieveDelayedCarrierStatusDiseaseRiskPresentation = function () {
                return delayedCarrierStatusDiseaseRiskPresentation;
            },
            retrieveDelayedBurdenTestPresentation = function () {
                return delayedBurdenTestPresentation;
            },
            retrieveCalculateDiseaseBurden = function () {
                return externalCalculateDiseaseBurden;
            },
            retrieveCarrierStatusDiseaseRisk = function () {
                return externalizeCarrierStatusDiseaseRisk;
            },
            retrieveVariantAssociationStatistics = function () {
                return externalVariantAssociationStatistics;
            },
            retrieveHowCommonIsThisVariantAcrossEthnicities = function () {
                return externalizeShowHowCommonIsThisVariantAcrossEthnicities;
            },
            retrieveDescribeImpactOfVariantOnProtein = function () {
                return describeImpactOfVariantOnProtein;
            },

            retrieveDelayedIgvLaunch = function () {
                return delayedIgvLaunch;
            },
            retrieveVariantPosition = function () {
                return variantPosition;
            };

        return {
            // private routines MADE PUBLIC FOR UNIT TESTING ONLY (find a way to do this in test mode only)

            // public routines
            retrieveDescribeImpactOfVariantOnProtein: retrieveDescribeImpactOfVariantOnProtein,
//            describeImpactOfVariantOnProtein: describeImpactOfVariantOnProtein,
            retrieveCalculateDiseaseBurden: retrieveCalculateDiseaseBurden,
            retrieveCarrierStatusDiseaseRisk: retrieveCarrierStatusDiseaseRisk,
            retrieveVariantAssociationStatistics: retrieveVariantAssociationStatistics,
            fillTheFields: fillTheFields,
            retrieveDelayedHowCommonIsPresentation: retrieveDelayedHowCommonIsPresentation,
            retrieveDelayedCarrierStatusDiseaseRiskPresentation: retrieveDelayedCarrierStatusDiseaseRiskPresentation,
            retrieveDelayedBurdenTestPresentation: retrieveDelayedBurdenTestPresentation,
            retrieveHowCommonIsThisVariantAcrossEthnicities: retrieveHowCommonIsThisVariantAcrossEthnicities,
            retrieveDelayedIgvLaunch: retrieveDelayedIgvLaunch,
            retrieveFieldsByName: retrieveFieldsByName,
            retrieveVariantPosition: retrieveVariantPosition,
            variantAssociations:variantAssociations,
            describeImpactOfVariantOnProtein:describeImpactOfVariantOnProtein,
            setTitlesAndTheLikeFromData:setTitlesAndTheLikeFromData
        }


    }());


})();

