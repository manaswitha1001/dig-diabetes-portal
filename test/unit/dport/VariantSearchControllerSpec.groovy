package dport

import grails.test.mixin.TestFor
import spock.lang.Specification

/**
 * See the API for {@link grails.test.mixin.web.ControllerUnitTestMixin} for usage instructions
 */
@TestFor(VariantSearchController)
class VariantSearchControllerSpec extends Specification {

    def setup() {
    }

    def cleanup() {
    }

    void "test variantSearch"() {
        setup:
        params.encParams = 'rs123'

        when:
        controller.variantSearch()

        then:
        response.status == 200
        view == '/variantSearch/variantSearch'
        model.show_gwas == 1

    }
}
