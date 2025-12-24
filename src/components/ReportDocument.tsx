import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 0,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        backgroundColor: '#003366',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 80,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
    },
    headerSubtitle: {
        color: '#ffffff',
        fontSize: 10,
        marginTop: 5,
    },
    dateText: {
        color: '#ffffff',
        fontSize: 10,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 30,
    },
    sectionTitle: {
        fontSize: 18,
        color: '#003366',
        borderBottomWidth: 1,
        borderBottomColor: '#003366',
        paddingBottom: 5,
        marginBottom: 15,
        fontFamily: 'Helvetica-Bold',
    },
    chartContainer: {
        width: '100%',
        alignItems: 'center',
    },
    chartImage: {
        width: 535, // Approx width for A4 with margins (72dpi)
        height: 'auto',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: {
        fontSize: 8,
        color: '#94a3b8',
    },
});

interface ReportDocumentProps {
    page1Image: string;
    page2Image: string;
    page3Image: string;
    date: string;
}

export const ReportDocument = ({ page1Image, page2Image, page3Image, date }: ReportDocumentProps) => (
    <Document title="Reporte de Gestión Legal">
        {/* Page 1 */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Reporte de Gestión Legal</Text>
                    <Text style={styles.headerSubtitle}>Resumen Estadístico de Casos</Text>
                </View>
                <Text style={styles.dateText}>{date}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Métricas de Casos y Crecimiento</Text>
                <View style={styles.chartContainer}>
                    <Image src={page1Image} style={styles.chartImage} />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Clínica Jurídica UCAB - Gestión Interna</Text>
                <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                    `Página ${pageNumber} de ${totalPages}`
                )} />
            </View>
        </Page>

        {/* Page 2 */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Datos Socio-Económicos I</Text>
                    <Text style={styles.headerSubtitle}>Perfil de los Solicitantes</Text>
                </View>
                <Text style={styles.dateText}>{date}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.chartContainer}>
                    <Image src={page2Image} style={styles.chartImage} />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Clínica Jurídica UCAB - Datos Confidenciales</Text>
                <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                    `Página ${pageNumber} de ${totalPages}`
                )} />
            </View>
        </Page>

        {/* Page 3 */}
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Datos Socio-Económicos II</Text>
                    <Text style={styles.headerSubtitle}>Perfil de los Solicitantes</Text>
                </View>
                <Text style={styles.dateText}>{date}</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.chartContainer}>
                    <Image src={page3Image} style={styles.chartImage} />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Clínica Jurídica UCAB - Datos Confidenciales</Text>
                <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                    `Página ${pageNumber} de ${totalPages}`
                )} />
            </View>
        </Page>
    </Document>
);
