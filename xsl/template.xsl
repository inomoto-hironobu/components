<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:yc="urn:yaohata-components"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" />

  <xsl:param name="url" />
  <xsl:param name="title" />
  <xsl:param name="text" />

  <xsl:template match="@yc:*">
    <xsl:attribute name="{local-name()}">
      <xsl:analyze-string select="." regex="\{{.+?\}}">
        <xsl:matching-substring>
          <xsl:message><xsl:value-of select="."/></xsl:message>
          <xsl:choose>
            <xsl:when test=". = '{url}'">
              <xsl:sequence select="$url"/>
            </xsl:when>
            <xsl:when test=". = '{title}'">
              <xsl:sequence select="$title"/>
            </xsl:when>
            <xsl:when test=". = '{text}'">
              <xsl:sequence select="$text"/>
            </xsl:when>
          </xsl:choose>
        </xsl:matching-substring>
        <xsl:non-matching-substring>
          <xsl:sequence select="."/>
        </xsl:non-matching-substring>
      </xsl:analyze-string>
    </xsl:attribute>
  </xsl:template>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>
</xsl:stylesheet>