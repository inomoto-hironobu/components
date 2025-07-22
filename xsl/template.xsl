<?xml version="1.0" encoding="UTF-8"?>
<!-- xmlns:tとした場合 -->
<xsl:stylesheet version="3.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:yc="yaohata-components"
  xmlns:map="http://www.w3.org/2005/xpath-functions/map"
  xpath-default-namespace="http://www.w3.org/1999/xhtml">
  <xsl:output method="xml" />

  <xsl:param name="params" as="map(*)"/>

  <xsl:template match="@*|node()">
    <xsl:copy>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates />
    </xsl:copy>
  </xsl:template>

  <xsl:template match="@*">
    <xsl:attribute name="{name()}">
      <xsl:analyze-string select="." regex="#\{{.+?\}}">
        <xsl:matching-substring>
          <xsl:sequence select="map:get($params, .)"/>
        </xsl:matching-substring>
        <xsl:non-matching-substring>
          <xsl:sequence select="."/>
        </xsl:non-matching-substring>
      </xsl:analyze-string>
    </xsl:attribute>
  </xsl:template>

  <xsl:template match="yc:template">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="yc:attribute[not(ancestor::yc:attribute)]" mode="#default">
    <xsl:attribute name="{@name}">
      <xsl:apply-templates/>
    </xsl:attribute>
  </xsl:template>

  <xsl:template match="*[has-children(yc:attribute)]">
    <xsl:variable name="children" as="node()*">
      <xsl:for-each select="node()">
        <!-- yc:attributeでない要素を集める -->
        <xsl:if test="not(namespace-uri() = 'yaohata-components' and local-name() = 'attribute')">
          <xsl:sequence select="."/>
        </xsl:if>
      </xsl:for-each>
    </xsl:variable>

    <xsl:copy>
      <xsl:apply-templates select="yc:attribute"/>
      <xsl:apply-templates select="@*" />
      <xsl:apply-templates select="$children"/>
    </xsl:copy>
  </xsl:template>

  <xsl:template match="yc:val">
    <xsl:if test="@name">
      <xsl:value-of select="map:get($params, @name)"/>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>