// ---------------------------------------------------------------------------
// <copyright file="Scrubber.cs" company="Microsoft">
//     Copyright (c) Microsoft Corporation.  All rights reserved.
// </copyright>
// ---------------------------------------------------------------------------

namespace ScrubberNamespace
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text.RegularExpressions;

    public class Scrubber
    {
        public const string EmailRegExPattern = @"[a-zA-Z0-9!#$+\-^_~]+(?:\.[a-zA-Z0-9!#$+\-^_~]+)*@(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,6}";
	public static string ScrubData(string data, char replacementChar){
            Regex rx = new Regex(EmailRegExPattern);
            StringBuilder sb = new StringBuilder(data.Length);
            int i = 0;
            foreach (Match match in rx.Matches(data))
            {
                sb.Append(data.Substring(i, match.Index - i));
                sb.Append(new string(replacementChar, match.Value.Length));
                i = match.Index + match.Value.Length;
            }
            sb.Append(data.Substring(i));

            return sb.ToString();
        }
    }
}
