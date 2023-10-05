export const palette = {
  primaryBgColor: "#274073",
  secondaryColor: "#516bbc",
  textColor: "#d5eaf2",
  secondaryTextColor: "#ffffff",
  accentColor: "#88a0bf",
  tertiaryColor: "#adc8d9",
  alternateButtonColor: "#342773",
  alternateButtonColor2: "#732740",
};

export const fonts = {
  baseFontFamily: "GlacialIndifference-Regular",
};

export type FlexDirection = "row" | "column";
export type Position = "absolute" | "relative" | "fixed" | "static" | "sticky";
export type ObjectFit = "cover" | "fill" | "contain" | "none" | "scale-down";

const styles = {
  index: {
    backgroundColor: palette.primaryBgColor,
    display: "flex",
    flexDirection: "row" as FlexDirection,
    justifyContent: "center",
    width: "100%",
    flex: 1,
  },
  index2: {
    backgroundColor: palette.primaryBgColor,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    flex: 1,
  },
  absoluteFill: {
    position: "absolute" as Position,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  splash: {
    backgroundColor: palette.primaryBgColor,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    backgroundColor: palette.primaryBgColor,
    alignItems: "center",
  },
  splashLogo: {
    width: 200,
    height: 200,
  },
  div: {
    backgroundColor: palette.primaryBgColor,
    height: "auto",
    position: "relative" as Position,
    width: 393,
    padding: 20,
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  flexButtonContainer: {
    flexDirection: "row" as FlexDirection,
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  loginButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: palette.secondaryColor,
    borderRadius: 50,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: palette.alternateButtonColor,
    borderRadius: 50,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  basicButton: {
    width: "100%",
    alignItems: "center",
    backgroundColor: palette.secondaryColor,
    borderRadius: 50,
    height: 40,
    justifyContent: "center",
  },
  alternateButton: {
    width: "100%",
    alignItems: "center",
    backgroundColor: palette.alternateButtonColor,
    borderRadius: 50,
    height: 40,
    justifyContent: "center",
  },
  tertiaryButton: {
    width: "100%",
    alignItems: "center",
    backgroundColor: palette.alternateButtonColor2,
    borderRadius: 50,
    height: 40,
    justifyContent: "center",
  },
  buttonText: {
    color: palette.textColor,
    fontFamily: fonts.baseFontFamily,
    fontSize: 20,
    fontWeight: "900",
  },
  textInputContainer: {
    width: "100%",
    alignItems: "center",
  },
  textInput: {
    width: "100%",
    height: 40,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#000000",
  },
  header: {
    backgroundColor: palette.primaryBgColor,
    flexDirection: "row" as FlexDirection,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontFamily: fonts.baseFontFamily,
    fontSize: 40,
    fontWeight: "300",
    color: palette.textColor,
  },
  splashTitle: {
    fontFamily: fonts.baseFontFamily,
    fontSize: 50,
    fontWeight: "300",
    color: palette.textColor,
  },
  tertiaryHeaderTitle: {
    fontFamily: fonts.baseFontFamily,
    fontSize: 20,
    fontWeight: "300",
    color: "black",
  },
  secondaryHeaderTitle: {
    fontFamily: fonts.baseFontFamily,
    fontSize: 20,
    fontWeight: "300",
    color: palette.secondaryTextColor,
  },
  detailText: {
    fontFamily: fonts.baseFontFamily,
    fontSize: 15,
    fontWeight: "300",
    color: palette.accentColor,
  },
  findSessionMap: {
    width: "100%",
    height: 300,
    alignItems: "center",
  },
};

export default styles;
