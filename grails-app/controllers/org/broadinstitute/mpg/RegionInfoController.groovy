package org.broadinstitute.mpg

import org.broadinstitute.mpg.diabetes.MetaDataService
import org.broadinstitute.mpg.diabetes.metadata.Property

class RegionInfoController {
    RestServerService restServerService
    MetaDataService metaDataService
    WidgetService widgetService

    def regionInfo() {
        LinkedHashMap extractedNumbers =  restServerService.extractNumbersWeNeed(params.id)
        if ((extractedNumbers)   &&
                (extractedNumbers["startExtent"])   &&
                (extractedNumbers["endExtent"])&&
                (extractedNumbers["chromosomeNumber"]) ){
            List<String> identifiedGenes = restServerService.retrieveGenesInExtents(
                    [chromosomeSpecified:extractedNumbers.chromosomeNumber,
                    beginningExtentSpecified:extractedNumbers.startExtent,
                    endingExtentSpecified:extractedNumbers.endExtent])
            render (view: 'regionInfo', model:[regionDescription:extractedNumbers,
                                               identifiedGenes:identifiedGenes])
            return
        }
        render (view: 'regionInfo', model:[])
    }



    def fillCredibleSetTable() {
        String jsonReturn;
        String chromosome = params.chromosome; // ex "22"
        String startString = params.start; // ex "29737203"
        String endString = params.end; // ex "29937203"
        String phenotype = params.phenotype;
        String dataSet = params.dataSet
        String dataType = params.datatype
        String propertyName = params.propertyName


        int startInteger;
        int endInteger;
        String errorJson = "{\"data\": {}, \"error\": true}";

        // if have all the information, call the widget service
        try {
            startInteger = Integer.parseInt(startString);
            endInteger = Integer.parseInt(endString);

            if (chromosome != null) {

                if (dataType=='static'){ // dynamically get the property name for static datasets
                    Property property = metaDataService.getPropertyForPhenotypeAndSampleGroupAndMeaning(phenotype,dataSet,'P_VALUE')
                    propertyName = property.name
                }

                jsonReturn = widgetService.getCredibleSetInformation(chromosome, startInteger, endInteger, dataSet, phenotype,propertyName);
            } else {
                jsonReturn = errorJson;
            }

            // log
            log.info("got LZ result: " + jsonReturn);

            // log end
            Date endTime = new Date();
            log.info("LZ call returned in: " + (endTime?.getTime() - startTime?.getTime()) + " milliseconds");

        } catch (NumberFormatException exception) {
            log.error("got incorrect parameters for LZ call: " + params);
            jsonReturn = errorJson;
        }

        // return
        render(status: 200, contentType: "application/json") (jsonReturn)
        return
    }



}
