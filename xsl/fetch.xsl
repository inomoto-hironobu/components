<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:yc="urn:yaohata-components"
  xmlns:fn="http://www.w3.org/2005/xpath-functions"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" />

  <xsl:param name="path" />
  <xsl:param name="target"/>
  <xsl:param name="document"/>

  <xsl:template match="@yc:*">
    <xsl:attribute name="{local-name()}">
      <xsl:analyze-string select="." regex="\{{.+?\}}">
        <xsl:matching-substring>
          <xsl:message><xsl:value-of select="."/></xsl:message>
          <xsl:choose>
            <xsl:when test=". = '{path}'">
              <xsl:sequence select="$path"/>
            </xsl:when>
            <xsl:when test=". = '{title}'">
              <xsl:sequence select="$document/html/head/title"/>
            </xsl:when>
          </xsl:choose>
        </xsl:matching-substring>
        <xsl:non-matching-substring>
          <xsl:sequence select="."/>
        </xsl:non-matching-substring>
      </xsl:analyze-string>
    </xsl:attribute>
  </xsl:template>

  <xsl:template match="yc:content">
    <xsl:copy-of select="$document//*[@id=$target]/*"></xsl:copy-of>
  </xsl:template>
  <xsl:template match="yc:title">
    <xsl:value-of select="$document/html/head/title"/>
  </xsl:template>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>